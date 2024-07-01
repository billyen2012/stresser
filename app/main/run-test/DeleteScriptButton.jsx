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
 * onSuccess:(scriptId:string)=>void;
 * }} param0
 * @returns
 */
export default function DeleteScriptButton({
  scriptId = "",
  onSuccess = () => {},
  isDisabled = false,
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const handleDelete = async () => {
    if (scriptId === "") {
      throw new Error("script id is empty");
    }

    setIsSubmitting(true);
    const response = await fetch("/api/scripts/" + scriptId, {
      method: "DELETE",
    });

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
        onClick={() => {
          setIsOpen(true);
        }}
        title="delete script button"
        variant={"outline"}
        colorScheme={"red"}
        isLoading={isSubmitting}
        isDisabled={isDisabled}
      >
        <DeleteIcon />
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
          <ModalHeader>Confirm Delete Script?</ModalHeader>
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
