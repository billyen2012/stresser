"use client";
import { useFormik } from "formik";
import {
  FormControl,
  FormLabel,
  Box,
  Input,
  Stack,
  FormErrorMessage,
  Button,
} from "@chakra-ui/react";
import { isEmail } from "validator";
import { useState } from "react";
import { signIn } from "next-auth/react";
import { EmailIcon, LockIcon } from "@chakra-ui/icons";

const validate = ({ email, password }) => {
  const error = {};

  if (!email) {
    error.email = "is required";
  }

  if (email && !isEmail(email)) {
    error.email = "not a valid email";
  }

  if (!password) {
    error.password = "is required";
  }

  return error;
};

export default function CredentialSignInForm({ isInvalidSignIn }) {
  const [invalidSignIn, setInvalidSignIn] = useState(isInvalidSignIn);
  const form = useFormik({
    initialValues: {
      email: "",
      password: "",
    },
    validate,
    async onSubmit({ email, password }) {
      await signIn(`credentials`, {
        username: email,
        password,
      });
    },
  });

  const handleChange = (e) => {
    invalidSignIn && setInvalidSignIn(false);
    form.handleChange(e);
  };

  return (
    <>
      <form onSubmit={form.handleSubmit}>
        <Stack gap={"0.5rem"} mb="1rem">
          <FormControl
            isInvalid={
              (form.errors.email && form.touched.email) || invalidSignIn
            }
          >
            <FormLabel display={"flex"} alignItems={"center"} gap={"8px"}>
              <EmailIcon /> Email:
            </FormLabel>
            <Box display={"flex"} gap="8px" alignItems={"center"}>
              <Input
                value={form.values.email}
                name="email"
                onChange={handleChange}
              />
            </Box>
            <FormErrorMessage>
              {invalidSignIn ? "invalid username/password" : form.errors.email}
            </FormErrorMessage>
          </FormControl>
          <FormControl
            isInvalid={
              (form.errors.password && form.touched.password) || invalidSignIn
            }
          >
            <FormLabel display={"flex"} alignItems={"center"} gap={"8px"}>
              <LockIcon /> Password:
            </FormLabel>
            <Box display={"flex"} gap="8px" alignItems={"center"}>
              <Input
                value={form.values.password}
                name="password"
                onChange={handleChange}
                type="password"
              />
            </Box>
            <FormErrorMessage>
              {invalidSignIn
                ? "invalid username/password"
                : form.errors.password}
            </FormErrorMessage>
          </FormControl>
        </Stack>
        <Button type="submit" w="100%" isLoading={form.isSubmitting}>
          Sign In
        </Button>
      </form>
    </>
  );
}
