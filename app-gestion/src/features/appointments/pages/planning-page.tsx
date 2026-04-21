import { useState, useCallback, useRef } from 'react'
import FullCalendar from '@fullcalendar/react'
import dayGridPlugin from '@fullcalendar/daygrid'
import timeGridPlugin from '@fullcalendar/timegrid'
import interactionPlugin from '@fullcalendar/interaction'
import type { DateSelectArg, EventClickArg, DatesSetArg } from '@fullcalendar/core'
import { PageHeader } from '@/components/shared/page-header'
import { useConsultationsByRange } from '@/features/consultations/hooks/use-consultations'
import { ConsultationSheet } from '@/features/consultations/components/consultation-sheet'
import type { ConsultationWithRelations } from '@/services/consultations.service'

export default function PlanningPage() {
  const calendarRef = useRef<FullCalendar>(null)

  const [dateRange, setDateRange] = useState(() => {
    const now = new Date()
    const start = new Date(now.getFullYear(), now.getMonth(), now.getDate() - now.getDay() + 1)
    const end = new Date(start)
    end.setDate(end.getDate() + 7)
    return { start: start.toISOString(), end: end.toISOString() }
  })

  const { data: consultations = [] } = useConsultationsByRange(dateRange.start, dateRange.end)

  // Sheet state
  const [sheetOpen, setSheetOpen] = useState(false)
  const [selectedConsultation, setSelectedConsultation] = useState<ConsultationWithRelations | undefined>()
  const [defaultStart, setDefaultStart] = useState<string | undefined>()
  const [defaultEnd, setDefaultEnd] = useState<string | undefined>()

  const handleDatesSet = useCallback((arg: DatesSetArg) => {
    setDateRange({
      start: arg.start.toISOString(),
      end: arg.end.toISOString(),
    })
  }, [])

  const handleDateSelect = useCallback((selectInfo: DateSelectArg) => {
    setSelectedConsultation(undefined)
    setDefaultStart(selectInfo.startStr)
    setDefaultEnd(selectInfo.endStr)
    setSheetOpen(true)
    selectInfo.view.calendar.unselect()
  }, [])

  const handleEventClick = useCallback((clickInfo: EventClickArg) => {
    const consultation = clickInfo.event.extendedProps.consultation as ConsultationWithRelations
    setSelectedConsultation(consultation)
    setDefaultStart(undefined)
    setDefaultEnd(undefined)
    setSheetOpen(true)
  }, [])

  const events = consultations.map(c => ({
    id: c.id,
    title: `${c.clients?.last_name ?? c.animals?.clients?.last_name ?? ''} ${c.clients?.first_name ?? c.animals?.clients?.first_name ?? ''}${c.animals ? ` - ${c.animals.name}` : ''}`,
    start: c.start_time!,
    end: c.end_time!,
    backgroundColor: c.color,
    borderColor: c.color,
    extendedProps: { consultation: c },
  })).filter(e => e.start && e.end)

  return (
    <div>
      <PageHeader title="Planning" description="Gestion des consultations" />

      <div className="bg-card rounded-lg border p-4">
        <FullCalendar
          ref={calendarRef}
          plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
          initialView="timeGridWeek"
          headerToolbar={{
            left: 'prev,next today',
            center: 'title',
            right: 'timeGridDay,timeGridWeek,dayGridMonth',
          }}
          locale="fr"
          buttonText={{
            today: "Aujourd'hui",
            month: 'Mois',
            week: 'Semaine',
            day: 'Jour',
          }}
          selectable
          selectMirror
          editable={false}
          events={events}
          select={handleDateSelect}
          eventClick={handleEventClick}
          datesSet={handleDatesSet}
          allDaySlot={false}
          slotMinTime="00:00:00"
          slotMaxTime="24:00:00"
          height="80vh"
          slotDuration="00:30:00"
          scrollTime="06:00:00"
          nowIndicator
        />
      </div>

      <ConsultationSheet
        open={sheetOpen}
        onOpenChange={setSheetOpen}
        consultation={selectedConsultation}
        defaultStart={defaultStart}
        defaultEnd={defaultEnd}
      />
    </div>
  )
}
