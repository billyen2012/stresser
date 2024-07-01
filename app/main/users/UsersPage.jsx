"use client";
import { DataTable } from "@/components/DataTable";
import UserInfo from "@/components/UserInfo";
import { Box } from "@chakra-ui/react";
import { createColumnHelper } from "@tanstack/react-table";
import { useMemo } from "react";
import SuspendButton from "./SuspendButton";
import UserRoleButton from "./UserRoleButton";

/**
 * @type {import("@tanstack/react-table").ColumnHelper<import("@prisma/client").User>}
 */
const columnHelper = createColumnHelper();

/**
 * @param {{
 *  data:import("@prisma/client").User[];
 * }} param0
 */
export default function UsersPage({ data = [] }) {
  const columns = useMemo(
    () => [
      columnHelper.accessor("name", {
        header: "Basic Info",
        cell: ({ row, column }) => {
          return <UserInfo user={row.original} />;
        },
      }),
      columnHelper.accessor("isSuspended", {
        header: "Account Status",
        cell: ({ row }) => {
          return <SuspendButton user={row.original} />;
        },
      }),
      columnHelper.accessor("isAdmin", {
        header: "Role",
        cell: ({ row }) => {
          return <UserRoleButton user={row.original} />;
        },
      }),
    ],
    []
  );

  return (
    <Box p="1rem">
      <DataTable columns={columns} data={data} />
    </Box>
  );
}
