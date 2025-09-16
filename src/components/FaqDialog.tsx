"use client";

import type React from "react";
import { useCallback, useState } from "react";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import Accordion from "@mui/material/Accordion";
import AccordionSummary from "@mui/material/AccordionSummary";
import AccordionDetails from "@mui/material/AccordionDetails";
import Typography from "@mui/material/Typography";
import ExpandMoreRoundedIcon from "@mui/icons-material/ExpandMoreRounded";

export interface FaqDialogProps {
  open: boolean;
  onClose: () => void;
}

export default function FaqDialog({ open, onClose }: FaqDialogProps) {
  const [expanded, setExpanded] = useState<string | false>("panel-0");
  const handleChange = useCallback(
    (panel: string) => (_: React.SyntheticEvent, isExpanded: boolean) => {
      setExpanded(isExpanded ? panel : false);
    },
    [],
  );

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>FAQ</DialogTitle>
      <DialogContent dividers>
        <Accordion
          expanded={expanded === "panel-0"}
          onChange={handleChange("panel-0")}
        >
          <AccordionSummary expandIcon={<ExpandMoreRoundedIcon />}>
            <Typography variant="subtitle1">
              How do I start a new chat?
            </Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Typography variant="body2">
              Click the New Chat button (plus icon) in the toolbar to create a
              fresh session with a new ID. Before you start, make sure your API
              configuration is set by clicking the Settings button (gear icon)
              and filling Base URL, API Key, and Model. The chatbot won&apos;t
              work without a valid configuration.
            </Typography>
          </AccordionDetails>
        </Accordion>

        <Accordion
          expanded={expanded === "panel-1"}
          onChange={handleChange("panel-1")}
        >
          <AccordionSummary expandIcon={<ExpandMoreRoundedIcon />}>
            <Typography variant="subtitle1">
              How do I stop generation?
            </Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Typography variant="body2">
              Use the Stop button while the assistant is generating. This
              cancels the current response.
            </Typography>
          </AccordionDetails>
        </Accordion>

        <Accordion
          expanded={expanded === "panel-2"}
          onChange={handleChange("panel-2")}
        >
          <AccordionSummary expandIcon={<ExpandMoreRoundedIcon />}>
            <Typography variant="subtitle1">
              Where are messages stored?
            </Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Typography variant="body2">
              Messages are saved locally in your browser&apos;s localStorage for
              this chat ID. Clearing your browser storage will remove them.
            </Typography>
          </AccordionDetails>
        </Accordion>
        <Accordion
          expanded={expanded === "panel-3"}
          onChange={handleChange("panel-3")}
        >
          <AccordionSummary expandIcon={<ExpandMoreRoundedIcon />}>
            <Typography variant="subtitle1">
              Which model should I choose?
            </Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Typography variant="body2" component="div">
              Recommended options:
              <ul className="list-disc pl-5 pb-2 mt-2 space-y-1">
                <li>
                  <strong>gpt-5</strong>: Highest quality, supports tool calling
                  (including web search), best for reliability.
                </li>
                <li>
                  <strong>gpt-5-mini</strong>: Faster and cheaper than gpt-5,
                  supports tool calling and works well for most tasks.
                </li>
                <li>
                  <strong>gpt-5-nano</strong>: Cheapest & Fastest. Decent
                  response and supports basic tool calling but <em>cannot</em>{" "}
                  use the web search tool in this app.{" "}
                  <span className="text-blue-600">(Recommended)</span>
                </li>
              </ul>
              Not recommended:
              <ul className="list-disc pl-5 mt-2 space-y-1">
                <li>
                  <strong>gpt-5-chat</strong>: Does not support tool calling, so
                  features like web search or other tools won&apos;t work.
                </li>
              </ul>
              See the provider’s model comparison for details:
              <a
                href="https://platform.openai.com/docs/models/compare"
                target="_blank"
                rel="noopener noreferrer"
                className="ml-1 text-blue-600 hover:underline"
              >
                Model comparison
              </a>
              .
            </Typography>
          </AccordionDetails>
        </Accordion>

        <Accordion
          expanded={expanded === "panel-4"}
          onChange={handleChange("panel-4")}
        >
          <AccordionSummary expandIcon={<ExpandMoreRoundedIcon />}>
            <Typography variant="subtitle1">
              How do I report an issue?
            </Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Typography variant="body2">
              Use the Report button in the header to send feedback. Make sure to
              send the screenshots, screen records, or log so we can investigate
              better.
            </Typography>
          </AccordionDetails>
        </Accordion>
      </DialogContent>
    </Dialog>
  );
}
