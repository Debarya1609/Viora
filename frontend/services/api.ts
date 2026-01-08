const API_URL = "http://192.168.101.9:5000"; 

let token: string | null = null;

export function setToken(newToken: string | null) {
  token = newToken;
}

async function request(path: string, options: RequestInit = {}) {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string> | undefined),
  };
  if (token) headers.Authorization = `Bearer ${token}`;

  const res = await fetch(`${API_URL}${path}`, {
    ...options,
    headers,
  });

  const text = await res.text();
  let json: any = {};
  try {
    json = text ? JSON.parse(text) : {};
  } catch {
    // non‑JSON, ignore
  }

  if (!res.ok) {
    throw new Error(json.error || `Request failed: ${res.status}`);
  }
  return json;
}

/* ---------- Types ---------- */

export type User = {
  id: string;
  email: string;
  role: "patient" | "doctor";
  name?: string | null;
};

export type Medication = {
  id: string;
  patient_id: string;
  prescribed_by?: string | null;
  name: string;
  dosage?: string | null;
  frequency?: string | null;
  route?: string | null;
  start_date?: string | null;
  end_date?: string | null;
  instructions?: string | null;
  is_active: boolean;
  created_at?: string | null;
};

export type Appointment = {
  id: string;
  patient_id: string;
  doctor_id: string;
  start_time: string;
  end_time?: string | null;
  status: string; // scheduled, completed, cancelled, no_show
  reason?: string | null;
  notes?: string | null;
  created_at?: string | null;
};

export type PatientReport = {
  id: string;
  patient_id: string;
  uploaded_by?: string | null;
  type?: string | null;
  file_url: string;
  date?: string | null;
  notes?: string | null;
  created_at?: string | null;
};

/* ---------- API ---------- */

export const api = {
  /* Auth */

  async register(
    email: string,
    password: string,
    name?: string
  ): Promise<{ token: string; user: User }> {
    return request("/auth/register", {
      method: "POST",
      body: JSON.stringify({ email, password, name, role: "patient" }),
    });
  },

  async login(
    email: string,
    password: string
  ): Promise<{ token: string; user: User }> {
    return request("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });
  },

  async me(): Promise<User> {
    return request("/auth/me");
  },

  /* Medications */

  getMedications(): Promise<Medication[]> {
    return request("/medications");
  },

  createMedication(data: {
    name: string;
    dosage?: string;
    frequency?: string;
    route?: string;
    start_date?: string | null;
    end_date?: string | null;
    instructions?: string;
  }): Promise<Medication> {
    return request("/medications", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  updateMedication(
    id: string,
    data: Partial<{
      name: string;
      dosage: string;
      frequency: string;
      route: string;
      start_date: string | null;
      end_date: string | null;
      instructions: string;
      is_active: boolean;
    }>
  ): Promise<Medication> {
    return request(`/medications/${id}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    });
  },

  deleteMedication(id: string): Promise<{ ok: boolean }> {
    return request(`/medications/${id}`, {
      method: "DELETE",
    });
  },

  /* Appointments */

  getAppointments(): Promise<Appointment[]> {
    return request("/appointments");
  },

  createAppointment(data: {
    patient_id?: string; // required if doctor
    doctor_id?: string; // required if patient
    start_time: string;
    end_time?: string | null;
    reason?: string;
    notes?: string;
  }): Promise<Appointment> {
    return request("/appointments", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  updateAppointmentStatus(id: string, status: string): Promise<Appointment> {
    return request(`/appointments/${id}`, {
      method: "PATCH",
      body: JSON.stringify({ status }),
    });
  },

  /* Reports */

  getReports(): Promise<PatientReport[]> {
    return request("/reports");
  },

  createReport(data: {
    patient_id?: string; // required if doctor
    type?: string;
    file_url: string;
    date?: string;
    notes?: string;
  }): Promise<PatientReport> {
    return request("/reports", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  updateReport(
    id: string,
    data: Partial<{
      type: string;
      file_url: string;
      date: string | null;
      notes: string;
    }>
  ): Promise<PatientReport> {
    return request(`/reports/${id}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    });
  },

  deleteReport(id: string): Promise<{ ok: boolean }> {
    return request(`/reports/${id}`, {
      method: "DELETE",
    });
  },
};
