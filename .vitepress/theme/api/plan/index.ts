import { PlanItem } from '@theme/interface/plan';

export const getPlanJSON = async () => {
  const response = await fetch('/json/plan.json')
  const data: PlanItem[] = await response.json()
  return data;
}
