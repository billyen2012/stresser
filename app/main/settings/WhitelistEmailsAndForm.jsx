"use client";
import {
  getWhitelistEmails,
  getWhitelistEmailsQueryKey,
} from "@/hooks/getWhitelistEmails";
import {
  Box,
  Button,
  FormControl,
  FormErrorMessage,
  FormLabel,
  HStack,
  Input,
  TagCloseButton,
  TagLabel,
  Tag,
  Spinner,
  TagRightIcon,
  Text,
} from "@chakra-ui/react";
import { useQueryClient } from "@tanstack/react-query";
import axios, { AxiosError } from "axios";
import { useFormik } from "formik";
import { useState } from "react";

import isEmail from "validator/lib/isEmail";

const DEFAULT_VALUES = {
  email: "",
};

export default function WhitelistEmailsAndForm(props) {
  const [isDeletingItems, setIsDeletingItems] = useState([]);
  const [alreadyExist, setAlreadyExist] = useState(false);

  const queryClient = useQueryClient();

  const { data = [], isError, isLoading, error } = getWhitelistEmails();

  const form = useFormik({
    initialValues: DEFAULT_VALUES,
    validate({ email }) {
      if (!email) {
        return {
          email: "is required",
        };
      }

      if (!isEmail(email)) {
        return {
          email: "must be a valid email",
        };
      }

      return;
    },
    onSubmit: async (values) => {
      const res = await axios
        .post(`/api/whitelist/emails`, values)
        .catch((err) => err);

      if (res instanceof AxiosError) {
        if (res.response.status === 409) {
          return setAlreadyExist(true);
        }
      }

      queryClient.setQueryData(getWhitelistEmailsQueryKey, (oldData = []) => {
        return [...oldData, values.email];
      });

      form.resetForm();
    },
  });

  const handleDeleteEmailClick = async (email) => {
    setIsDeletingItems((current) => {
      return [...current, email];
    });
    const res = await fetch("/api/whitelist/emails/" + email, {
      method: "DELETE",
    });

    setIsDeletingItems((current) => {
      return current.filter((e) => e !== email);
    });

    if (!res.ok) {
      return alert("delete failed: " + (await res.text()));
    }

    queryClient.setQueryData(getWhitelistEmailsQueryKey, (oldData = []) => {
      return oldData.filter((e) => e !== email);
    });

    if (email === form.values.email && alreadyExist) {
      setAlreadyExist(false);
    }
  };

  if (isError) {
    return <Text>An Error has occured: {error.message}</Text>;
  }

  return (
    <Box {...props} display={"flex"} flexDir={"column"} gap="1rem">
      <form onSubmit={form.handleSubmit}>
        <FormControl
          isInvalid={(form.errors.email && form.touched.email) || alreadyExist}
        >
          <FormLabel display={"flex"} alignItems={"center"} gap={"8px"}>
            Whitelist email:
          </FormLabel>
          <Box display={"flex"} gap="8px" alignItems={"center"}>
            <Input
              value={form.values.email}
              name="email"
              onChange={(e) => {
                form.handleChange(e);
                if (data.includes(e.target.value)) {
                  return setAlreadyExist(true);
                }
                if (alreadyExist) {
                  setAlreadyExist(false);
                }
              }}
            />
            <Button
              name="create-email"
              type="submit"
              variant={"outline"}
              colorScheme={"green"}
              isLoading={form.isSubmitting || isLoading}
              isDisabled={alreadyExist}
            >
              Create
            </Button>
          </Box>
          <FormErrorMessage>
            {form.errors.email || (alreadyExist && "email already exist")}
          </FormErrorMessage>
        </FormControl>
      </form>
      <HStack spacing={4}>
        {data.map((email) => (
          <Tag
            size={"lg"}
            key={"whitelist-email-" + email}
            variant="outline"
            colorScheme="blue"
            overflow={"unset"}
            fontFamily={"monospace"}
          >
            <TagLabel>{email}</TagLabel>
            {isDeletingItems.includes(email) ? (
              <TagRightIcon as={Spinner} />
            ) : (
              <TagCloseButton
                title={"delete email " + email}
                onClick={() => {
                  handleDeleteEmailClick(email);
                }}
                isDisabled={form.isSubmitting}
              />
            )}
          </Tag>
        ))}
      </HStack>
    </Box>
  );
}
