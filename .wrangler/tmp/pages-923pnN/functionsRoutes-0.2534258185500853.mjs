import { onRequestGet as __api_admin_schedules_ts_onRequestGet } from "C:\\Dev\\Projects\\schedule-planner\\functions\\api\\admin\\schedules.ts"
import { onRequestPost as __api_admin_courses_ts_onRequestPost } from "C:\\Dev\\Projects\\schedule-planner\\functions\\api\\admin_courses.ts"
import { onRequestGet as __api_courses_ts_onRequestGet } from "C:\\Dev\\Projects\\schedule-planner\\functions\\api\\courses.ts"
import { onRequestPost as __api_courses_ts_onRequestPost } from "C:\\Dev\\Projects\\schedule-planner\\functions\\api\\courses.ts"
import { onRequestDelete as __api_schedules_ts_onRequestDelete } from "C:\\Dev\\Projects\\schedule-planner\\functions\\api\\schedules.ts"
import { onRequestGet as __api_schedules_ts_onRequestGet } from "C:\\Dev\\Projects\\schedule-planner\\functions\\api\\schedules.ts"
import { onRequestPost as __api_schedules_ts_onRequestPost } from "C:\\Dev\\Projects\\schedule-planner\\functions\\api\\schedules.ts"
import { onRequestGet as __api_stats_ts_onRequestGet } from "C:\\Dev\\Projects\\schedule-planner\\functions\\api\\stats.ts"

export const routes = [
    {
      routePath: "/api/admin/schedules",
      mountPath: "/api/admin",
      method: "GET",
      middlewares: [],
      modules: [__api_admin_schedules_ts_onRequestGet],
    },
  {
      routePath: "/api/admin_courses",
      mountPath: "/api",
      method: "POST",
      middlewares: [],
      modules: [__api_admin_courses_ts_onRequestPost],
    },
  {
      routePath: "/api/courses",
      mountPath: "/api",
      method: "GET",
      middlewares: [],
      modules: [__api_courses_ts_onRequestGet],
    },
  {
      routePath: "/api/courses",
      mountPath: "/api",
      method: "POST",
      middlewares: [],
      modules: [__api_courses_ts_onRequestPost],
    },
  {
      routePath: "/api/schedules",
      mountPath: "/api",
      method: "DELETE",
      middlewares: [],
      modules: [__api_schedules_ts_onRequestDelete],
    },
  {
      routePath: "/api/schedules",
      mountPath: "/api",
      method: "GET",
      middlewares: [],
      modules: [__api_schedules_ts_onRequestGet],
    },
  {
      routePath: "/api/schedules",
      mountPath: "/api",
      method: "POST",
      middlewares: [],
      modules: [__api_schedules_ts_onRequestPost],
    },
  {
      routePath: "/api/stats",
      mountPath: "/api",
      method: "GET",
      middlewares: [],
      modules: [__api_stats_ts_onRequestGet],
    },
  ]