"use client"

import { ColumnDef } from "@tanstack/react-table";

// Define the columns for the table
export const columns = [
  {
    accessorKey: "job",
    header: "Job",
  },
  {
    accessorKey: "type",
    header: "Type",
  },
  {
    accessorKey: "created",
    header: "Created",
  },
  {
    accessorKey: "location",
    header: "Location",
  },
  {
    accessorKey: "applicants",
    header: "Applicants",
  },
  {
    accessorKey: "status",
    header: "Status",
  },
];
