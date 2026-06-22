export const formatStatusLabel = (status) =>
  status
    ? status
        .split("_")
        .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
        .join(" ")
    : "Unknown";

export const createApplicationDraft = (student) => ({
  first_name: student?.first_name || "",
  last_name: student?.last_name || "",
  email: student?.email || "",
  phone: student?.phone || "",
  registration_no: student?.registration_no || "",
  department: student?.department || "",
  graduation_year: student?.graduation_year ?? "",
  cgpa: student?.cgpa ?? "",
  active_backlogs: student?.active_backlogs ?? 0,
  linkedin_url: student?.linkedin_url || "",
  portfolio_url: student?.portfolio_url || "",
  career_objective: student?.career_objective || "",
  skills_summary: student?.skills_summary || "",
  bio: student?.bio || "",
});

export const normalizeApplicationProfile = (draft) => ({
  ...draft,
  graduation_year:
    draft.graduation_year === "" ? "" : Number.parseInt(draft.graduation_year, 10),
  cgpa: draft.cgpa === "" ? "" : Number.parseFloat(draft.cgpa),
  active_backlogs:
    draft.active_backlogs === "" ? 0 : Number.parseInt(draft.active_backlogs, 10),
});
