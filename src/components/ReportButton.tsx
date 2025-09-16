"use client";

import Button from "@mui/material/Button";
import Tooltip from "@mui/material/Tooltip";

import ReportOutlinedIcon from "@mui/icons-material/ReportOutlined";
import Link from "next/link";

export default function ReportButton() {
  return (
    <Tooltip title="Report an issue or feedback" placement="bottom">
      <Button
        LinkComponent={Link}
        href="https://tally.so/r/wkLX9d"
        target="_blank"
        type="button"
        className="inline-flex items-center gap-1 rounded-full border border-rose-300 bg-rose-50 px-3 py-1 text-xs font-medium text-rose-700 hover:bg-rose-100 active:bg-rose-200 transition capitalize"
      >
        <ReportOutlinedIcon fontSize="small" className="!w-4 !h-4" />
        <span>Report</span>
      </Button>
    </Tooltip>
  );
}
