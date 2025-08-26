import { dashboardSummary } from "../services/analyticsService.js";
export const dashboardCtrl = (req, res, next) =>
  dashboardSummary()
    .then((data) => res.json(data))
    .catch(next);
