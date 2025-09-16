"use client";

import { useState } from "react";
import Tooltip from "@mui/material/Tooltip";
import IconButton from "@mui/material/IconButton";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import QuizRoundedIcon from "@mui/icons-material/QuizRounded";

import ReportButton from "~/components/ReportButton";
import FaqDialog from "~/components/FaqDialog";

export default function TopActions() {
  const [faqOpen, setFaqOpen] = useState(false);

  return (
    <div className="flex items-center gap-2">
      <ReportButton />
      <Tooltip title="FAQ" placement="bottom">
        <IconButton
          className="p-1 hover:bg-gray-100 text-gray-600"
          onClick={() => setFaqOpen(true)}
        >
          <QuizRoundedIcon className="w-4 h-4" />
        </IconButton>
      </Tooltip>

      <Tooltip
        title={
          <div>
            <strong>Beta Notice:</strong> This application is in development.
            Responses may be inaccurate or misleading. Please verify information
            independently.
          </div>
        }
        arrow
        className="max-w-xs"
        placement="bottom-end"
      >
        <IconButton className="p-1 hover:bg-gray-100 text-gray-500">
          <InfoOutlinedIcon className="w-4 h-4" />
        </IconButton>
      </Tooltip>

      <FaqDialog open={faqOpen} onClose={() => setFaqOpen(false)} />
    </div>
  );
}
