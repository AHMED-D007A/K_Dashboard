import { z } from "zod";

export const stepReportSchema = z.object({
  step_name: z.string(),
  step_count: z.number(),
  step_failure: z.number(),
  step_response_time: z.array(z.number()), // assuming ms or s
  step_bytes_in: z.number(),
  step_bytes_out: z.number(),
});

export const vuReportSchema = z.object({
  vu_id: z.number(),
  ts_exec_count: z.number(),
  ts_exec_failure: z.number(),
  ts_exec_time: z.array(z.number()), // assuming ms or s
  steps: z.array(stepReportSchema),
});
