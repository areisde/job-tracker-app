import OpenAI from "openai"
import { supabase } from "~/server/utils/supabase"
import dayjs from "dayjs"
import { geocode } from "~/server/utils/geocode"
import { normalizeDate } from "~/server/utils/dates"

const job_types = [
  "Data Scientist",
  "Machine Learning Engineer",
  "Machine Learning Scientist",
  "AI / LLM Specialist",
  "Data Engineer",
  "Analytics / Business Intelligence",
  "Product Manager",
  "Technical Product Manager",
  "Product Owner / Project Manager",
  "Strategy / Corporate Development",
  "Business Analyst",
  "Operations / Business Operations (BizOps)",
  "Partnerships / Business Development",
  "Innovation / Digital Transformation",
  "Sustainability / ESG Strategy",
  "Travel Tech / Domain Expert",
  "Other"
]

const industries = [
  "Artificial Intelligence",
  "Machine Learning / Data Science",
  "Software / SaaS",
  "Travel Tech",
  "Hospitality / Tourism",
  "Mobility / Automotive",
  "Management Consulting",
  "Digital Transformation",
  "Sustainability / Climate Tech",
  "Private Banking / Wealth Management",
  "Fintech",
  "Venture Capital / Startups",
  "Online Marketplaces",
  "Social Media / Content Platforms",
  "E-commerce",
  "Education / EdTech",
  "Public Sector / Government",
  "Luxury / Lifestyle"
]

const instruction = `Extract the job details from the following Linkedin job description. 
Return the result as a JSON object with keys: title, company, 
date (interpret based on today's date ${dayjs().format("DD-MM-YYYY")}), 
location (the most specific possible, if remote is mentioned, set it to remote), 
industry (pick one from ${JSON.stringify(industries)} for the industry the company operates in), description, type (pick one from ${JSON.stringify(job_types)}), 
seniority (seniority required for the position in years if mentioned, otherwise set it to 0),
recruiter (if mentioned with first name and family name, otherwise set to 0 if none is mentioned or only first name),
salary_down (set to 0 if none is mentioned, set to the lower bound if a range is mentioned, set to the salary value if only one value is mentioned),
salary_up (set to 0 if none is mentioned, set to the upper bound if a range is mentioned, set to the salary value if only one value is mentioned),
requirements (summarise them in batches of 1 or 2 words separated by a comma), 
responsibilities (summarise them in batches of 1 or 2 words separated by a comma).`;

export default defineEventHandler(async (event) => {
  const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })

  const { text } = await readBody(event)

  const response = await openai.chat.completions.create({
    model: "gpt-4o",
    messages: [
      { role: "system", content: instruction },
      { role: "user", content: text }
    ],
    response_format: { type: "json_object" }
  })

  const job = JSON.parse(response.choices?.[0]?.message?.content || "{}")

  const isRemote = job.location?.toLowerCase().includes("remote")
  const { latitude, longitude } = isRemote ? { latitude: null, longitude: null } : await geocode(job.location)


  const insert = {
    title : job.title || "",
    company: job.company || "",
    location: job.location || "",
    latitude : latitude,
    longitude : longitude,
    description: job.description || "",
    industry: job.industry || "",
    recruiter: job.recruiter || "",
    requirements: job.requirements || "",
    responsibilities: job.responsibilities || "",
    remote_status: isRemote ? "Remote" : "Onsite",
    seniority: job.seniority || 0,
    role_category: job.type,
    salary_down: job.salary_down || 0,
    salary_up: job.salary_up || 0,
    date_added: normalizeDate(job.date) || dayjs().format("YYYY-MM-DD"),
    date_applied: dayjs().format("YYYY-MM-DD"),
    job_link: job.link || "",
    application_status: "In Review",
    interviews: 0
  }

  const { data, error } = await supabase
    .from("job_applications")
    .insert([insert])
    .select()

  if (error) {
    console.error(error)
    return { status: "error", message: error.message }
  }

  return { status: "ok" }
})