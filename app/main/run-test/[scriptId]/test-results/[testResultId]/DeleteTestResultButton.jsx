"use client";
import { DeleteIcon } from "@chakra-ui/icons";
import {
  Button,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
} from "@chakra-ui/react";
import { useState } from "react";

/**
 *
 * @param {{
 * scriptId:string;
 * testResultId:string;
 * onSuccess:(scriptId:string)=>void;
 * }} param0
 * @returns
 */
export default function DeleteTestResultButton({
  scriptId = "",
  testResultId = "",
  onSuccess = () => {},
  ...restProps
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const handleDelete = async () => {
    if (scriptId === "") {
      throw new Error("script id is empty");
    }

    if (testResultId === "") {
      throw new Error("testResultId id is empty");
    }

    setIsSubmitting(true);
    const response = await fetch(
      "/api/scripts/" + scriptId + "/running-results/" + testResultId,
      {
        method: "DELETE",
      }
    );

    setIsSubmitting(false);
    if (!response.ok) {
      return alert(await response.text());
    }
    setIsOpen(false);
    onSuccess(scriptId);
  };
  return (
    <>
      <Button
        {...restProps}
        onClick={() => {
          setIsOpen(true);
        }}
        variant={"outline"}
        colorScheme={"red"}
        isLoading={isSubmitting}
        display={"flex"}
        alignItems={"center"}
        justifyContent={"center"}
        gap="0.5rem"
      >
        <DeleteIcon /> DELETE
      </Button>
      <Modal
        isOpen={isOpen}
        onClose={() => {
          setIsOpen(false);
        }}
        closeOnEsc={!isSubmitting}
        closeOnOverlayClick={!isSubmitting}
      >
        <ModalOverlay />
        <ModalContent>
          <ModalCloseButton
            onClick={() => {
              setIsOpen(false);
            }}
          />
          <ModalHeader>Confirm Delete Test Result?</ModalHeader>
          <ModalBody>
            Deleted data will be permanently lost and will not be able to
            recover.
          </ModalBody>
          <ModalFooter gap="1rem">
            <Button
              onClick={() => {
                setIsOpen(false);
              }}
              disabled={isSubmitting}
              variant={"outline"}
            >
              Cancel
            </Button>
            <Button
              onClick={handleDelete}
              isLoading={isSubmitting}
              loadingText="Deleting"
              colorScheme={"red"}
              variant={"outline"}
            >
              Delete
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
}
