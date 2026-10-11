"use client";

import Nav from "@/components/Nav";
import TransactionsDataGrid from "@/components/ui/TransactionsTable";
import { FiFilter, FiUpload } from "react-icons/fi";
import { GoPlus } from "react-icons/go";
import Button from "@mui/material/Button";
import Stack from "@mui/material/Stack";
import { Link } from "react-router-dom";

/* ✅ Main Banks Page */
function Banks() {
  return (
    <div className="min-h-screen bg-gray-50 ">
      {/* Top Nav */}
      <div className="px-4 py-3 flex items-center justify-between bg-white border-b">
        <div className="flex justify-end w-full ">
          <Nav />
        </div>
      </div>

      {/* Main Content */}
      <div className=" max-w-7xl mx-auto ">
        <div className="bg-white rounded-xl shadow-sm p-4 ">
          {/* Title + Toolbar row */}
          <div className="flex items-center justify-between mb-4 p-4 ">
            {/* Left side */}
            <h2 className="text-xl font-semibold">All Transder</h2>

            {/* Right side (buttons) */}
            <Stack direction="row" spacing={3}>
              {/* Filter Button */}
              <Button
                startIcon={<FiFilter />}
                size="small"
                className="px-4 py-2 rounded-full bg-white border border-gray-300 text-gray-700 shadow hover:bg-gray-100 hover:scale-105 transition-transform duration-200 font-medium"
              >
                Filter
              </Button>

              {/* Export Button */}
              <Button
                startIcon={<FiUpload />}
                size="small"
                className="px-4 py-2 rounded-full bg-white border border-gray-300 text-gray-700 shadow hover:bg-gray-100 hover:scale-105 transition-transform duration-200 font-medium"
              >
                Export
              </Button>

              {/* Add New Button */}
              <Link to={"/Dashboard/Treasury/CreateTreasury"}>
  <Button
    startIcon={<GoPlus />}
    size="small"
    sx={{
      px: 3, // padding left/right yar → button-ka yaree
      py: 1.2, // padding top/bottom
      borderRadius: "9999px", // pill-style
      background: "linear-gradient(to bottom, #1e3a8a, #1e40af)", // blue-800 gradient
      color: "white",
      fontWeight: 500,
      boxShadow: "0 4px 6px rgba(0,0,0,0.1)",
      textTransform: "none",
      fontSize: "0.875rem", // yar si text-ka u habboon
      "&:hover": {
        background: "linear-gradient(to right, #2563eb, #1d4ed8)", // hover darker
      },
    }}
  >
    Add New
  </Button>
</Link>

            </Stack>
          </div>

          {/* Transactions Table */}
          <TransactionsDataGrid />
        </div>
      </div>
    </div>
  );
}

export default Banks;
