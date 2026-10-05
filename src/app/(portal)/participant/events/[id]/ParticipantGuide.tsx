'use client'

import { useState } from 'react'
import { 
  BookOpen, 
  QrCode, 
  Users, 
  Rocket, 
  Link, 
  UserCircle, 
  AlertTriangle,
  ChevronDown
} from 'lucide-react'

type Section = {
  id: string
  title: string
  icon: React.ReactNode
  content: React.ReactNode
}

export function ParticipantGuide() {
  const [openSection, setOpenSection] = useState<string | null>(null)

  const toggleSection = (id: string) => {
    setOpenSection(openSection === id ? null : id)
  }

  const sections: Section[] = [
    {
      id: 'matrix',
      title: 'Using Your Data Matrix',
      icon: <QrCode size={18} className="text-blue-500" />,
      content: (
        <div className="space-y-4 text-sm text-slate-600 dark:text-slate-300">
          <div>
            <h4 className="font-bold text-slate-800 dark:text-slate-200 mb-1">Your Data Matrix is personal</h4>
            <ul className="list-disc pl-5 space-y-1">
              <li>Your Data Matrix codes are generated specifically for your account and event.</li>
              <li>Do NOT share screenshots or copies of your Data Matrix codes with other participants.</li>
              <li>Do NOT use another participant&apos;s Data Matrix code.</li>
              <li>Keep your codes private.</li>
            </ul>
          </div>
          <div>
            <h4 className="font-bold text-slate-800 dark:text-slate-200 mb-1">Attendance</h4>
            <ul className="list-disc pl-5 space-y-1">
              <li>Show the Attendance Data Matrix to the coordinator when attendance is being recorded.</li>
              <li>The coordinator will scan the code.</li>
              <li>Do not repeatedly present or scan the same code after a successful scan.</li>
            </ul>
          </div>
          <div>
            <h4 className="font-bold text-slate-800 dark:text-slate-200 mb-1">Food</h4>
            <p className="mb-1">Use the appropriate Data Matrix for each meal: Breakfast → Breakfast Data Matrix, Lunch → Lunch Data Matrix, Dinner → Dinner Data Matrix.</p>
            <ul className="list-disc pl-5 space-y-1">
              <li>Only show the appropriate meal code at the respective food counter.</li>
              <li>Meal access depends on your registered meal preference and event configuration.</li>
              <li>If a scan fails, contact the coordinator instead of repeatedly attempting the scan.</li>
            </ul>
          </div>
          <div>
            <h4 className="font-bold text-slate-800 dark:text-slate-200 mb-1">If scanning fails</h4>
            <ol className="list-decimal pl-5 space-y-1">
              <li>Keep the Data Matrix visible.</li>
              <li>Ask the coordinator to retry once.</li>
              <li>If the problem continues, contact the event/admin support.</li>
              <li>Do not attempt to modify or recreate the code yourself.</li>
            </ol>
          </div>
        </div>
      )
    },
    {
      id: 'team',
      title: 'Team & Problem Statement',
      icon: <Users size={18} className="text-indigo-500" />,
      content: (
        <div className="space-y-4 text-sm text-slate-600 dark:text-slate-300">
          <div>
            <h4 className="font-bold text-slate-800 dark:text-slate-200 mb-1">My Team</h4>
            <ul className="list-disc pl-5 space-y-1">
              <li>Check your team name, team leader, and team members.</li>
              <li>Confirm that your registration status is correct.</li>
            </ul>
          </div>
          <div>
            <h4 className="font-bold text-slate-800 dark:text-slate-200 mb-1">Problem Statement</h4>
            <ul className="list-disc pl-5 space-y-1">
              <li>Problem statements published by Admin are available in the Team Portal.</li>
              <li>The team selects ONE problem statement.</li>
              <li>Problem statement selection belongs to the entire team.</li>
              <li>Only the Team Leader should select the team&apos;s problem statement.</li>
              <li>Team members can view the selected problem statement.</li>
            </ul>
          </div>
        </div>
      )
    },
    {
      id: 'submission',
      title: 'Project Submission',
      icon: <Rocket size={18} className="text-purple-500" />,
      content: (
        <div className="space-y-4 text-sm text-slate-600 dark:text-slate-300">
          <div>
            <h4 className="font-bold text-slate-800 dark:text-slate-200 mb-1">Who can submit?</h4>
            <p>Only the Team Leader can submit or edit the team&apos;s project submission.</p>
          </div>
          <div>
            <h4 className="font-bold text-slate-800 dark:text-slate-200 mb-1">Requirements</h4>
            <p>Required: GitHub Repository URL. Optional: Deployed Project URL.</p>
          </div>
          <div>
            <h4 className="font-bold text-slate-800 dark:text-slate-200 mb-1">Editing</h4>
            <ul className="list-disc pl-5 space-y-1">
              <li>The initial submission is allowed once.</li>
              <li>After the initial submission, the Team Leader can edit the submission up to 3 times.</li>
              <li>Team members cannot edit the submission.</li>
              <li>After the third edit, the submission becomes locked.</li>
            </ul>
            <div className="mt-3 p-3 bg-slate-50 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 italic font-medium">
              &quot;Submit carefully. You have a maximum of 3 edits after your initial submission.&quot;
            </div>
          </div>
        </div>
      )
    },
    {
      id: 'participants',
      title: 'Connecting with Participants',
      icon: <Link size={18} className="text-cyan-500" />,
      content: (
        <div className="space-y-4 text-sm text-slate-600 dark:text-slate-300">
          <p className="italic font-medium text-slate-700 dark:text-slate-200">
            &quot;Use this section to discover other participants and connect professionally.&quot;
          </p>
          <div>
            <h4 className="font-bold text-slate-800 dark:text-slate-200 mb-1">Guidelines</h4>
            <ul className="list-disc pl-5 space-y-1">
              <li>Use LinkedIn to connect professionally.</li>
              <li>Respect other participants.</li>
              <li>Do not spam or misuse another participant&apos;s information.</li>
              <li>Do not share or misuse information outside the event platform.</li>
            </ul>
          </div>
        </div>
      )
    },
    {
      id: 'coordinators',
      title: 'Coordinators & Support',
      icon: <UserCircle size={18} className="text-emerald-500" />,
      content: (
        <div className="space-y-4 text-sm text-slate-600 dark:text-slate-300">
          <div>
            <h4 className="font-bold text-slate-800 dark:text-slate-200 mb-1">Coordinators</h4>
            <p className="mb-1">Coordinators may assist with:</p>
            <ul className="list-disc pl-5 space-y-1">
              <li>Attendance scanning</li>
              <li>Breakfast, Lunch, and Dinner scanning</li>
              <li>Event-day operational issues</li>
            </ul>
          </div>
          <div>
            <h4 className="font-bold text-slate-800 dark:text-slate-200 mb-1">For technical problems</h4>
            <ol className="list-decimal pl-5 space-y-1">
              <li>Do not repeatedly retry.</li>
              <li>Show the issue to the assigned coordinator.</li>
              <li>If the coordinator cannot resolve it, contact the event admin/help desk.</li>
            </ol>
          </div>
          <div>
            <h4 className="font-bold text-slate-800 dark:text-slate-200 mb-1">For registration/team issues</h4>
            <p className="mb-1">Contact the event admin for:</p>
            <ul className="list-disc pl-5 space-y-1">
              <li>Missing team members or incorrect registration details</li>
              <li>Team assignment problems</li>
              <li>Problem statement issues</li>
              <li>Project submission issues</li>
            </ul>
          </div>
        </div>
      )
    },
    {
      id: 'guidelines',
      title: 'Important Guidelines',
      icon: <AlertTriangle size={18} className="text-amber-500" />,
      content: (
        <div className="space-y-4 text-sm text-slate-600 dark:text-slate-300">
          <div>
            <h4 className="font-bold text-slate-800 dark:text-slate-200 mb-1">Keep your account secure</h4>
            <ul className="list-disc pl-5 space-y-1">
              <li>Do not share your password or login credentials.</li>
              <li>Do not use another participant&apos;s account.</li>
            </ul>
          </div>
          <div>
            <h4 className="font-bold text-slate-800 dark:text-slate-200 mb-1">Protect your Data Matrix</h4>
            <ul className="list-disc pl-5 space-y-1">
              <li>Never share your Data Matrix screenshots.</li>
              <li>Never use another participant&apos;s code.</li>
              <li>Your codes are intended only for your own event operations.</li>
            </ul>
          </div>
          <div>
            <h4 className="font-bold text-slate-800 dark:text-slate-200 mb-1">During scanning</h4>
            <ul className="list-disc pl-5 space-y-1">
              <li>Present the correct code.</li>
              <li>Wait for the coordinator to confirm the scan.</li>
              <li>Avoid repeated scans.</li>
            </ul>
          </div>
          <div>
            <h4 className="font-bold text-slate-800 dark:text-slate-200 mb-1">During the event</h4>
            <ul className="list-disc pl-5 space-y-1">
              <li>Follow coordinator/admin instructions.</li>
              <li>Keep your registration and team information correct.</li>
              <li>Report technical problems immediately.</li>
              <li>Do not attempt to bypass event procedures.</li>
            </ul>
          </div>
        </div>
      )
    }
  ]

  return (
    <section className="bg-white dark:bg-[#080d1a] border border-slate-100 dark:border-cyan-900/20 rounded-3xl p-6 sm:p-8 shadow-[0_8px_30px_rgb(0,0,0,0.03)] mt-8">
      <div className="mb-6 pb-6 border-b border-slate-100 dark:border-cyan-900/20">
        <h2 className="font-extrabold text-xl sm:text-2xl text-slate-900 dark:text-white flex items-center gap-3 mb-1">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white shadow-lg shadow-blue-500/20">
            <BookOpen size={20} />
          </div>
          Participant Guide
        </h2>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Everything you need to know before and during the event.
        </p>
      </div>

      <div className="space-y-3">
        {sections.map((section) => (
          <div 
            key={section.id} 
            className="border border-slate-200 dark:border-cyan-900/30 rounded-xl overflow-hidden bg-slate-50/50 dark:bg-slate-900/20"
          >
            <button
              onClick={() => toggleSection(section.id)}
              className="w-full flex items-center justify-between p-4 sm:px-5 sm:py-4 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors text-left focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500"
              aria-expanded={openSection === section.id}
            >
              <div className="flex items-center gap-3">
                {section.icon}
                <span className="font-bold text-slate-800 dark:text-slate-200">{section.title}</span>
              </div>
              <ChevronDown 
                size={18} 
                className={`text-slate-400 transition-transform duration-200 ${openSection === section.id ? 'rotate-180' : ''}`} 
              />
            </button>
            
            {openSection === section.id && (
              <div className="p-4 sm:px-5 sm:pb-5 pt-0 bg-white dark:bg-[#0a0f1d] border-t border-slate-100 dark:border-cyan-900/20">
                <div className="pt-4">
                  {section.content}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </section>
  )
}
