"use client";
import { useFormik } from "formik";
import {
  FormControl,
  FormLabel,
  Box,
  Input,
  Stack,
  FormErrorMessage,
  FormHelperText,
  Button,
  useToast,
} from "@chakra-ui/react";
import { useState } from "react";
import { isEmail } from "validator";
import axios, { AxiosError } from "axios";
import { signIn } from "next-auth/react";

const validate = ({ name, email, password, confirmPassword }) => {
  const error = {};

  if (!name) {
    error.name = "is required";
  }

  if (!email) {
    error.email = "is required";
  }

  if (email && !isEmail(email)) {
    error.email = "not a valid email";
  }

  if (!password) {
    error.password = "is required";
  }

  if (password) {
    if (password.length < 8) {
      error.password = "min password length is 8";
    }
    if (password !== confirmPassword) {
      error.confirmPassword = "not match to password";
    }
  }

  return error;
};

export default function Register() {
  const [alreadyExist, setAlreadyExist] = useState(false);
  const [emailNotAuthorized, setEmailNotAuthorized] = useState(false);
  const toast = useToast();
  const form = useFormik({
    initialValues: {
      email: "",
      name: "",
      password: "",
      confirmPassword: "",
    },
    validate,
    async onSubmit(values) {
      const data = { ...values };
      delete data.confirmPassword;

      const res = await axios.post(`/api/register`, data).catch((err) => err);

      if (res instanceof AxiosError) {
        if (res.response.status == 409) {
          return setAlreadyExist(true);
        }

        if (res.response.data === "EmailNotAuthorized") {
          return setEmailNotAuthorized(true);
        }

        toast({
          position: "top-right",
          title: "Register new account failed",
          description:
            typeof res.response.data === "object"
              ? JSON.stringify(res.response.data)
              : res.response.data,
          status: "error",
        });
        return;
      }

      await signIn(`credentials`, {
        username: data.email,
        password: data.password,
      });
    },
  });
  return (
    <>
      <form onSubmit={form.handleSubmit}>
        <Stack gap={"0.5rem"} mb="1rem">
          <FormControl
            isInvalid={
              (form.errors.email && form.touched.email) ||
              alreadyExist ||
              emailNotAuthorized
            }
          >
            <FormLabel display={"flex"} alignItems={"center"} gap={"8px"}>
              Email:
            </FormLabel>
            <Box display={"flex"} gap="8px" alignItems={"center"}>
              <Input
                value={form.values.email}
                name="email"
                onChange={(e) => {
                  alreadyExist && setAlreadyExist(false);
                  emailNotAuthorized && setEmailNotAuthorized(false);
                  form.handleChange(e);
                }}
              />
            </Box>
            <FormErrorMessage>
              {form.errors.email ||
                (alreadyExist && "email already exist") ||
                (emailNotAuthorized && "This email is not authorized")}
            </FormErrorMessage>
          </FormControl>
          <FormControl isInvalid={form.errors.name && form.touched.name}>
            <FormLabel display={"flex"} alignItems={"center"} gap={"8px"}>
              Name:
            </FormLabel>
            <Box display={"flex"} gap="8px" alignItems={"center"}>
              <Input
                value={form.values.name}
                name="name"
                onChange={form.handleChange}
              />
            </Box>
            <FormErrorMessage>{form.errors.name}</FormErrorMessage>
          </FormControl>
          <FormControl
            isInvalid={form.errors.password && form.touched.password}
          >
            <FormLabel display={"flex"} alignItems={"center"} gap={"8px"}>
              Password:
            </FormLabel>
            <Box display={"flex"} gap="8px" alignItems={"center"}>
              <Input
                value={form.values.password}
                name="password"
                onChange={form.handleChange}
                type="password"
                autoComplete="new-password"
              />
            </Box>
            <FormErrorMessage>{form.errors.password}</FormErrorMessage>
            {form.submitCount == 0 && (
              <FormHelperText>min password length is 8</FormHelperText>
            )}
          </FormControl>
          <FormControl
            isInvalid={
              form.errors.confirmPassword && form.touched.confirmPassword
            }
          >
            <FormLabel display={"flex"} alignItems={"center"} gap={"8px"}>
              Confirm Password:
            </FormLabel>
            <Box display={"flex"} gap="8px" alignItems={"center"}>
              <Input
                value={form.values.confirmPassword}
                name="confirmPassword"
                onChange={form.handleChange}
                type="password"
                autoComplete="new-password"
              />
            </Box>
            <FormErrorMessage>{form.errors.confirmPassword}</FormErrorMessage>
          </FormControl>
        </Stack>
        <Button type="submit" w="100%" isLoading={form.isSubmitting}>
          Register New Account
        </Button>
      </form>
    </>
  );
}
