export type ConsultationStatus = "new" | "in-progress" | "confirmed";

export type ConsultationSubmission = {
  id: string;
  name: string;
  email: string;
  phone: string;
  date: string;
  time: string;
  consultationType: string;
  request: string;
  submittedAt: string;
  status: ConsultationStatus;
};

export type ConsultationSubmissionInput = Omit<
  ConsultationSubmission,
  "id" | "submittedAt" | "status"
>;

const STORAGE_KEY = "ow-couture-consultation-submissions";

function isBrowser() {
  return typeof window !== "undefined";
}

function sortByMostRecent(items: ConsultationSubmission[]) {
  return [...items].sort((a, b) => {
    return new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime();
  });
}

function parseStoredSubmissions(rawValue: string | null) {
  if (!rawValue) {
    return [];
  }

  try {
    const parsedValue = JSON.parse(rawValue);
    if (!Array.isArray(parsedValue)) {
      return [];
    }

    return parsedValue.filter((item): item is ConsultationSubmission => {
      return (
        item &&
        typeof item.id === "string" &&
        typeof item.name === "string" &&
        typeof item.email === "string" &&
        typeof item.phone === "string" &&
        typeof item.date === "string" &&
        typeof item.time === "string" &&
        typeof item.consultationType === "string" &&
        typeof item.request === "string" &&
        typeof item.submittedAt === "string" &&
        (item.status === "new" || item.status === "in-progress" || item.status === "confirmed")
      );
    });
  } catch {
    return [];
  }
}

function saveConsultationSubmissions(items: ConsultationSubmission[]) {
  if (!isBrowser()) {
    return;
  }

  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(sortByMostRecent(items)));
}

export function getConsultationSubmissions() {
  if (!isBrowser()) {
    return [];
  }

  const storedItems = parseStoredSubmissions(window.localStorage.getItem(STORAGE_KEY));
  return sortByMostRecent(storedItems);
}

export function addConsultationSubmission(input: ConsultationSubmissionInput) {
  const createdSubmission: ConsultationSubmission = {
    ...input,
    id: typeof crypto !== "undefined" && typeof crypto.randomUUID === "function" ? crypto.randomUUID() : `${Date.now()}`,
    submittedAt: new Date().toISOString(),
    status: "new",
  };

  if (!isBrowser()) {
    return createdSubmission;
  }

  const existingSubmissions = getConsultationSubmissions();
  const updatedSubmissions = [createdSubmission, ...existingSubmissions].slice(0, 200);
  saveConsultationSubmissions(updatedSubmissions);

  return createdSubmission;
}

export function updateConsultationSubmissionStatus(id: string, status: ConsultationStatus) {
  if (!isBrowser()) {
    return [];
  }

  const existingSubmissions = getConsultationSubmissions();
  const updatedSubmissions = existingSubmissions.map((submission) => {
    if (submission.id !== id) {
      return submission;
    }

    return {
      ...submission,
      status,
    };
  });

  saveConsultationSubmissions(updatedSubmissions);
  return updatedSubmissions;
}