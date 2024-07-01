import NextAuth, { CredentialsSignin } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import { PrismaAdapter } from "@auth/prisma-adapter";
import sha256 from "crypto-js/sha256";
import { SIGN_IN_PAGE_URL } from "@/constant/sign-in-page-url";
import { prisma } from "@/server/db";
import CryptoJS from "crypto-js";
import { randomId } from "./util/randomId";
import { MAIN_APP_LANDING_PAGE_URL } from "@/constant/main-app-landing-page-url";
import { randomUUID } from "crypto";
import { ERROR_CODES } from "@/constant/error-code";

/**
 * @param {string} str
 */
export const encrypt = (str) => {
  return CryptoJS.AES.encrypt(str, process.env.APP_SECRET).toString(
    CryptoJS.format.OpenSSL
  );
};

/**
 * @param {string} str
 */
export const decrypt = (str) => {
  const bytes = CryptoJS.AES.decrypt(str, process.env.APP_SECRET);
  return bytes.toString(CryptoJS.enc.Utf8);
};

/**
 * @param {import("@prisma/client").User} user
 * @param {string} password
 * @returns
 */
export const getSignature = (email, password) => {
  return CryptoJS.HmacSHA512(email + password, process.env.APP_SECRET).toString(
    CryptoJS.enc.Hex
  );
};

/**
 * @param {import("@prisma/client").User} user
 * @returns
 */
export const isWhitelisted = async (user) => {
  if (user.isAdmin) {
    return true;
  }

  if (!user.email) {
    throw new Error("email prop is required for isWhitelisted() function");
  }

  const whitelistDomains = await prisma.whitelistDomain
    .findMany({
      select: {
        domain: true,
      },
    })
    .then((res) => res.map((e) => e.domain));

  const [_, userEmailDomain] = user.email.split("@");

  if (whitelistDomains.includes(userEmailDomain)) {
    return true;
  }

  const whitelistEmails = await prisma.whitelistEmail
    .findMany({
      select: {
        email: true,
      },
    })
    .then((res) => res.map((e) => e.email));

  if (whitelistEmails.includes(user.email)) {
    return true;
  }

  return false;
};

export const providers = [
  GoogleProvider({
    clientId: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    async profile(token) {
      const user = await prisma.user.findUnique({
        where: {
          email: token.email.toLocaleLowerCase() || "",
        },
      });

      // user ever use Oauth to login, it will disable user from sign-in with email & password
      if (user && user.isLinkedToOAuthAccount == false) {
        await prisma.user.update({
          where: {
            id: user.id,
          },
          data: {
            isLinkedToOAuthAccount: true,
            password: randomId(8), // override password
          },
        });
      }

      return {
        email: token.email,
        name: token.name,
        id: token.sub,
        emailVerified: token.email_verified,
        isLinkedToOAuthAccount: true,
        isAdmin: user == null ? true : user.isAdmin,
        image: token.picture,
        password: "",
      };
    },
    allowDangerousEmailAccountLinking: true,
  }),
  CredentialsProvider({
    name: "credentials",
    /**
     * @param {{
     *  username:string;
     *  password:string;
     *  csrfToken:string;
     *  callbackUrl:string;
     * }} credentials
     */
    async authorize(credentials, req) {
      // Add logic here to look up the user from the credentials supplied
      const user = await prisma.user.findUnique({
        where: {
          email: String(credentials.username).toLowerCase() || "",
        },
      });

      if (!user) {
        const error = new CredentialsSignin();
        error.code = ERROR_CODES.INVALID_SIGN_IN;
        throw error;
      }

      if (user.isLinkedToOAuthAccount) {
        const error = new CredentialsSignin();
        error.code = ERROR_CODES.IS_LINKED_TO_OAUTH_ACCOUNT;
        throw error;
      }

      const signature = getSignature(user.email, credentials.password);

      if (signature !== user.password) {
        const error = new CredentialsSignin();
        error.code = ERROR_CODES.INVALID_SIGN_IN;
        throw error;
      }

      const sessionToken = randomUUID();
      const sessionExpiry = new Date(Date.now() + 60 * 60 * 24 * 30 * 1000);
      await prismaAdapter.createSession({
        sessionToken: sessionToken,
        userId: user.id,
        expires: sessionExpiry,
      });

      user.sessionToken = sessionToken;

      return user;
    },
  }),
];

const prismaAdapter = PrismaAdapter(prisma);
export const {
  handlers: { GET, POST },
  auth,
  signIn,
  signOut,
  update,
} = NextAuth({
  adapter: {
    ...prismaAdapter,
    async createUser(data) {
      data.isAdmin =
        (await prisma.user.findFirst({ select: { id: true } })) == null;

      data.emailHash = sha256(data.email.toLowerCase()).toString();

      // if create user is from OAuth, then just assume is is already verified
      if (data.isLinkedToOAuthAccount) {
        data.emailVerified = new Date();
        data.password = getSignature(data.email, randomId());
      }

      return prismaAdapter.createUser(data);
    },
  },
  pages: {
    signIn: SIGN_IN_PAGE_URL,
  },
  providers,
  jwt: {
    encode(params) {
      return params.token.sessionToken;
    },
  },
  callbacks: {
    async signIn({ user }) {
      if (user.isAdmin) {
        return true;
      }

      if (user.isSuspended) {
        const error = new CredentialsSignin();
        error.code = ERROR_CODES.ACCOUNT_SUSPENDED;
        throw error;
      }

      if ((await isWhitelisted(user)) == false) {
        const error = new CredentialsSignin();
        error.code = ERROR_CODES.EMAIL_NOT_AUTHORIZED;
        throw error;
      }

      return true;
    },
    session({ session, token, user }) {
      delete user.password;
      delete user.updatedAt;
      session.user = user;
      return session;
    },
    jwt({ token, user }) {
      if (user?.sessionToken) {
        token.sessionToken = user.sessionToken;
      }
      return token;
    },
    redirect() {
      return MAIN_APP_LANDING_PAGE_URL;
    },
  },
  trustHost: ["localhost:3000"],
  session: {
    strategy: "database",
    generateSessionToken: () => {
      return randomUUID();
    },
  },
});
