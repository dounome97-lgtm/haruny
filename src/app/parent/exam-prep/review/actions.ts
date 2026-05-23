"use server";

import { redirect } from "next/navigation";
import { saveDemoExamPrepPlan } from "@/services/examPrepPersistence";

export async function startExamPrepPlanAction() {
  await saveDemoExamPrepPlan();
  redirect("/");
}
