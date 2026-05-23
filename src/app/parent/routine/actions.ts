"use server";

import { redirect } from "next/navigation";
import { saveDemoRoutinePlan } from "@/services/routinePersistence";

export async function startRoutinePlanAction(formData: FormData) {
  await saveDemoRoutinePlan(formData);
  redirect("/");
}
