"use client";
import {
  getWhitelistDomains,
  getWhitelistDomainsQueryKey,
} from "@/hooks/getWhitelistDomains";
import { isValidDomainName } from "@/server/util/isValidDomainName";
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

const DEFAULT_VALUES = {
  domain: "",
};

export default function WhitelistDomainsAndForm(props) {
  const [isDeletingItems, setIsDeletingItems] = useState([]);
  const [alreadyExist, setAlreadyExist] = useState(false);

  const queryClient = useQueryClient();

  const { data = [], isError, isLoading, error } = getWhitelistDomains();

  const form = useFormik({
    initialValues: DEFAULT_VALUES,
    validate({ domain }) {
      if (!domain) {
        return {
          domain: "is required",
        };
      }

      if (!isValidDomainName(domain)) {
        return {
          domain: "is not a valid domain name",
        };
      }

      return;
    },
    onSubmit: async (values) => {
      const res = await axios
        .post(`/api/whitelist/domains`, values)
        .catch((err) => err);

      if (res instanceof AxiosError) {
        if (res.response.status === 409) {
          return setAlreadyExist(true);
        }
      }

      queryClient.setQueryData(getWhitelistDomainsQueryKey, (oldData = []) => {
        return [...oldData, values.domain];
      });

      form.resetForm();
    },
  });

  const handleDeleteEmailClick = async (domain) => {
    setIsDeletingItems((current) => {
      return [...current, domain];
    });
    const res = await fetch("/api/whitelist/domains/" + domain, {
      method: "DELETE",
    });

    setIsDeletingItems((current) => {
      return current.filter((e) => e !== domain);
    });

    if (!res.ok) {
      return alert("delete failed: " + (await res.text()));
    }

    queryClient.setQueryData(getWhitelistDomainsQueryKey, (oldData = []) => {
      return oldData.filter((e) => e !== domain);
    });

    if (domain === form.values.domain && alreadyExist) {
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
          isInvalid={
            (form.errors.domain && form.touched.domain) || alreadyExist
          }
        >
          <FormLabel display={"flex"} alignItems={"center"} gap={"8px"}>
            Whitelist email domain:
          </FormLabel>
          <Box display={"flex"} gap="8px" alignItems={"center"}>
            <Input
              value={form.values.domain}
              name="domain"
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
              name="create-domain"
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
            {form.errors.domain || (alreadyExist && "domain already exist")}
          </FormErrorMessage>
        </FormControl>
      </form>
      <HStack spacing={4}>
        {data.map((domain) => (
          <Tag
            size={"lg"}
            key={"whitelist-email-" + domain}
            variant="outline"
            colorScheme="blue"
            overflow={"unset"}
            fontFamily={"monospace"}
          >
            <TagLabel>{domain}</TagLabel>
            {isDeletingItems.includes(domain) ? (
              <TagRightIcon as={Spinner} />
            ) : (
              <TagCloseButton
                title={"delete email " + domain}
                onClick={() => {
                  handleDeleteEmailClick(domain);
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
