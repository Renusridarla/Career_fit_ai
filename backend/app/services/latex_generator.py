import logging
from app.schemas.resume import ParsedResumeData

logger = logging.getLogger(__name__)

def escape_latex(text: str) -> str:
    """
    Escapes special LaTeX characters in plain text string.
    """
    if not text:
        return ""
    
    # Order matters: backslash first
    text = text.replace("\\", r"\textbackslash{}")
    replacements = {
        "&": r"\&",
        "%": r"\%",
        "$": r"\$",
        "#": r"\#",
        "_": r"\_",
        "{": r"\{",
        "}": r"\}",
        "~": r"\textasciitilde{}",
        "^": r"\textasciicircum{}",
    }
    for orig, rep in replacements.items():
        text = text.replace(orig, rep)
    return text

def generate_latex_resume(resume: ParsedResumeData) -> str:
    """
    Generates clean, professional, Overleaf-ready LaTeX code representing the candidate's resume.
    """
    p = resume.personal
    name = escape_latex(p.name if p.name else "Candidate Name")

    contact_parts = []
    if p.email:
        contact_parts.append(f"\\href{{mailto:{p.email}}}{{{escape_latex(p.email)}}}")
    if p.phone:
        contact_parts.append(escape_latex(p.phone))
    if p.location:
        contact_parts.append(escape_latex(p.location))
    if p.linkedin:
        url = p.linkedin if p.linkedin.startswith("http") else f"https://{p.linkedin}"
        contact_parts.append(f"\\href{{{url}}}{{LinkedIn}}")
    if p.github:
        url = p.github if p.github.startswith("http") else f"https://{p.github}"
        contact_parts.append(f"\\href{{{url}}}{{GitHub}}")
    if p.portfolio:
        url = p.portfolio if p.portfolio.startswith("http") else f"https://{p.portfolio}"
        contact_parts.append(f"\\href{{{url}}}{{Portfolio}}")

    contact_line = " \\ | \\ ".join(contact_parts)

    latex_lines = [
        r"\documentclass[11pt,a4paper]{article}",
        r"\usepackage[utf8]{inputenc}",
        r"\usepackage[margin=0.6in]{geometry}",
        r"\usepackage{hyperref}",
        r"\usepackage{enumitem}",
        r"\usepackage{titlesec}",
        r"\usepackage{xcolor}",
        "",
        r"\hypersetup{colorlinks=true, linkcolor=blue, urlcolor=blue}",
        r"\titleformat{\section}{\large\bfseries\uppercase}{}{0pt}{}[\titlerule]",
        r"\titlespacing*{\section}{0pt}{10pt}{4pt}",
        r"\pagestyle{empty}",
        "",
        r"\begin{document}",
        "",
        r"% --- HEADER ---",
        r"\begin{center}",
        f"    {{\\LARGE \\textbf{{{name}}}}}\\\\[4pt]",
        f"    \\small {contact_line}",
        r"\end{center}",
        r"\vspace{-4pt}"
    ]

    # Professional Summary
    if resume.summary:
        latex_lines.extend([
            "",
            r"% --- PROFESSIONAL SUMMARY ---",
            r"\section*{Professional Summary}",
            escape_latex(resume.summary)
        ])

    # Technical Skills
    s = resume.skills
    skill_rows = []
    if s.programming_languages:
        skill_rows.append(f"\\textbf{{Languages:}} {escape_latex(', '.join(s.programming_languages))}")
    if s.frontend:
        skill_rows.append(f"\\textbf{{Frontend:}} {escape_latex(', '.join(s.frontend))}")
    if s.backend:
        skill_rows.append(f"\\textbf{{Backend:}} {escape_latex(', '.join(s.backend))}")
    if s.databases:
        skill_rows.append(f"\\textbf{{Databases:}} {escape_latex(', '.join(s.databases))}")
    if s.cloud:
        skill_rows.append(f"\\textbf{{Cloud/DevOps:}} {escape_latex(', '.join(s.cloud))}")
    if s.tools:
        skill_rows.append(f"\\textbf{{Tools:}} {escape_latex(', '.join(s.tools))}")
    if s.frameworks:
        skill_rows.append(f"\\textbf{{Frameworks:}} {escape_latex(', '.join(s.frameworks))}")
    if s.other:
        skill_rows.append(f"\\textbf{{Other:}} {escape_latex(', '.join(s.other))}")

    if skill_rows:
        latex_lines.extend([
            "",
            r"% --- TECHNICAL SKILLS ---",
            r"\section*{Technical Skills}",
            r"\begin{itemize}[leftmargin=0.15in, label={}, itemsep=2pt]"
        ])
        for sr in skill_rows:
            latex_lines.append(f"    \\item {sr}")
        latex_lines.append(r"\end{itemize}")

    # Work Experience
    if resume.experience:
        latex_lines.extend([
            "",
            r"% --- WORK EXPERIENCE ---",
            r"\section*{Work Experience}"
        ])
        for exp in resume.experience:
            role = escape_latex(exp.role)
            company = escape_latex(exp.company)
            dates = escape_latex(exp.dates) if exp.dates else ""

            latex_lines.append(f"\\textbf{{{role}}} --- \\textbf{{{company}}} \\hfill \\textit{{{dates}}}\\\\")

            bullet_items = []
            for resp in exp.responsibilities:
                bullet_items.append(escape_latex(resp))
            for ach in exp.achievements:
                bullet_items.append(f"\\textbf{{Achievement:}} {escape_latex(ach)}")

            if bullet_items:
                latex_lines.append(r"\begin{itemize}[leftmargin=0.25in, topsep=2pt, itemsep=2pt]")
                for item in bullet_items:
                    latex_lines.append(f"    \\item {item}")
                latex_lines.append(r"\end{itemize}")
            latex_lines.append(r"\vspace{4pt}")

    # Key Projects
    if resume.projects:
        latex_lines.extend([
            "",
            r"% --- KEY PROJECTS ---",
            r"\section*{Key Projects}"
        ])
        for proj in resume.projects:
            pname = escape_latex(proj.name)
            tech = escape_latex(", ".join(proj.technologies)) if proj.technologies else ""
            tech_str = f" --- \\textit{{{tech}}}" if tech else ""

            latex_lines.append(f"\\textbf{{{pname}}}{tech_str}\\\\")

            bullet_items = []
            if proj.description:
                bullet_items.append(escape_latex(proj.description))
            for resp in proj.responsibilities:
                bullet_items.append(escape_latex(resp))
            for ach in proj.highlights:
                bullet_items.append(escape_latex(ach))

            if bullet_items:
                latex_lines.append(r"\begin{itemize}[leftmargin=0.25in, topsep=2pt, itemsep=2pt]")
                for item in bullet_items:
                    latex_lines.append(f"    \\item {item}")
                latex_lines.append(r"\end{itemize}")
            latex_lines.append(r"\vspace{4pt}")

    # Education
    if resume.education:
        latex_lines.extend([
            "",
            r"% --- EDUCATION ---",
            r"\section*{Education}"
        ])
        for edu in resume.education:
            degree = escape_latex(edu.degree)
            institution = escape_latex(edu.institution)
            grad_date = escape_latex(edu.graduation_date) if edu.graduation_date else ""
            gpa = escape_latex(edu.gpa) if edu.gpa else ""

            gpa_str = f" \\ | \\ GPA: {gpa}" if gpa else ""

            latex_lines.append(f"\\textbf{{{degree}}} \\hfill \\textit{{{grad_date}}}\\\\")
            latex_lines.append(f"{institution}{gpa_str}\\\\")
            latex_lines.append(r"\vspace{2pt}")

    # Certifications
    if hasattr(resume, 'certifications') and resume.certifications:
        latex_lines.extend([
            "",
            r"% --- CERTIFICATIONS ---",
            r"\section*{Certifications}",
            r"\begin{itemize}[leftmargin=0.25in, topsep=2pt, itemsep=2pt]"
        ])
        for cert in resume.certifications:
            name = escape_latex(cert.name)
            issuer = escape_latex(cert.issuer) if cert.issuer else ""
            date = escape_latex(cert.date) if cert.date else ""
            cert_str = f"\\textbf{{{name}}}" + (f" -- {issuer}" if issuer else "") + (f" ({date})" if date else "")
            latex_lines.append(f"    \\item {cert_str}")
        latex_lines.append(r"\end{itemize}")

    # Honors & Achievements
    if hasattr(resume, 'achievements') and resume.achievements:
        latex_lines.extend([
            "",
            r"% --- HONORS \& ACHIEVEMENTS ---",
            r"\section*{Honors \& Achievements}",
            r"\begin{itemize}[leftmargin=0.25in, topsep=2pt, itemsep=2pt]"
        ])
        for ach in resume.achievements:
            latex_lines.append(f"    \\item {escape_latex(ach)}")
        latex_lines.append(r"\end{itemize}")

    latex_lines.extend([
        "",
        r"\end{document}"
    ])

    return "\n".join(latex_lines)
