import { z } from "zod";

export const stepResultSchema = z.object({
  step_name: z.string(),
  method: z.string(),
  url: z.string(),
  status: z.string(),
  status_code: z.number().optional(),
  response_time: z.number(), // assuming ms or s, adjust as needed
  failure_reason: z.string().optional(),
  extracted_vars: z.record(z.string()).optional(),
  req_bytes: z.number(),
  res_bytes: z.number(),
});

export const stepReportSchema = z.object({
  step_name: z.string(),
  step_count: z.number(),
  step_failure: z.number(),
  step_response_time: z.array(z.number()), // assuming ms or s
  step_results: z.array(stepResultSchema),
});

export const vuReportSchema = z.object({
  vu_id: z.number(),
  ts_exec_count: z.number(),
  ts_exec_failure: z.number(),
  ts_exec_time: z.array(z.number()), // assuming ms or s
  steps: z.array(stepReportSchema),
});
