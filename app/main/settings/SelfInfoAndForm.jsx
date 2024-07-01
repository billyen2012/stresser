import useSession from "@/hooks/useSession";
import {
  Box,
  Button,
  FormControl,
  FormErrorMessage,
  FormLabel,
  Input,
  Stack,
} from "@chakra-ui/react";
import axios, { AxiosError } from "axios";
import { useFormik } from "formik";
import { useRouter } from "next/navigation";

export default function SelfInfoAndForm() {
  const session = useSession();

  const router = useRouter();

  const form = useFormik({
    initialValues: {
      name: session.user.name,
    },
    validate({ name }) {
      const error = {};
      if (!name) {
        error.name = "is required";
      }

      return error;
    },
    onSubmit: async (values) => {
      const res = await axios.put(`/api/self`, values).catch((err) => err);

      if (res instanceof AxiosError) {
        return alert(res.message);
      }

      router.refresh();
      form.resetForm(values);
    },
    enableReinitialize: true,
  });

  return (
    <form onSubmit={form.handleSubmit}>
      <Stack spacing={"1rem"}>
        <FormControl isInvalid={form.errors.name && form.touched.name}>
          <FormLabel>User Id:</FormLabel>
          <Input value={session.user.id} isDisabled />
        </FormControl>
        <FormControl>
          <FormLabel>Name:</FormLabel>
          <Input
            value={form.values.name}
            name="name"
            onChange={form.handleChange}
          />
          <FormErrorMessage>{form.errors.name}</FormErrorMessage>
        </FormControl>
        <Box display={"flex"} alignItems={"center"} justifyContent={"flex-end"}>
          <Button
            type={"submit"}
            isDisabled={!form.dirty || form.isSubmitting}
            colorScheme={"green"}
            variant={"outline"}
          >
            Save
          </Button>
        </Box>
      </Stack>
    </form>
  );
}
