'use client'
import { useState, useEffect } from 'react'
import FullCalendar from '@fullcalendar/react'
import momentPlugin from '@fullcalendar/moment'
import dayGridPlugin from '@fullcalendar/daygrid'
import resourceTimelinePlugin from '@fullcalendar/resource-timeline'
import resourceTimeGridPlugin from '@fullcalendar/resource-timegrid'
import interactionPlugin from '@fullcalendar/interaction'
import timeGridPlugin from '@fullcalendar/timegrid'
import frLocale from '@fullcalendar/core/locales/fr'
import listPlugin from '@fullcalendar/list'
import Swal from 'sweetalert2'

export default function Calendar () {
  const [events, setEvents] = useState([])

  const fetchEvents = async () => {
    try {
      const response = await fetch('http://localhost:1337/api/calendar-events')
      const data = await response.json()

      const formattedEvents = data.data.map(event => ({
        title: event.attributes.title,
        start: event.attributes.date_debut,
        end: event.attributes.date_fin,
        id: event.id,
        backgroundColor: event.attributes.color
      }))

      setEvents(formattedEvents)
    } catch (error) {
      console.error('Erreur lors de la récupération des événements :', error)
    }
  }

  useEffect(() => {
    fetchEvents()
  }, [])

  const handleEventClick = clickInfo => {
    Swal.fire({
      title: 'Êtes-vous sûr?',
      text: 'Voulez-vous supprimer cet événement ?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#2fb8c5',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Oui, supprimez-le!',
      cancelButtonText: 'Non, annulez!'
    }).then(async (result) => {
      if (result.value) {
        try {
          const response = await fetch(`http://localhost:1337/api/calendar-events/${clickInfo.event.id}`, {
            method: 'DELETE'
          })

          if (response.ok) {
            Swal.fire('Supprimé!', 'Votre événement a été supprimé.', 'success')
            fetchEvents()
          } else {
            throw new Error('Erreur lors de la suppression de l\'événement')
          }
        } catch (error) {
          console.error('Erreur lors de la suppression de l\'événement :', error)
        }
      }
    })
  }

  const handleDateSelect = async selectInfo => {
    const { startStr, endStr, allDay } = selectInfo

    const { value: eventName } = await Swal.fire({
      title: 'Créer un événement',
      input: 'text',
      inputAttributes: {
        autocapitalize: 'off'
      },
      showCancelButton: true,
      confirmButtonText: 'Créer',
      confirmButtonColor: '#2fb8c5',
      cancelButtonText: 'Annuler',
      showLoaderOnConfirm: true
    })

    if (!eventName) {
      Swal.showValidationMessage('Veuillez entrer le nom de l\'événement')
      return
    }

    const { value: color } = await Swal.fire({
      title: 'Sélectionnez une couleur',
      input: 'select',
      inputOptions: {
        '#d33': 'Rouge',
        '#28a701': 'Vert',
        '#2fb8c5': 'Bleu'
      },
      inputPlaceholder: 'Sélectionnez une couleur',
      confirmButtonText: 'OK',
      showCancelButton: true,
      cancelButtonText: 'Annuler'
    })

    if (!color) {
      Swal.showValidationMessage('Veuillez sélectionner une couleur')
      return
    }

    const newEvent = {
      title: eventName,
      date_debut: startStr,
      date_fin: endStr,
      allDay,
      color
    }

    try {
      const response = await fetch('http://localhost:1337/api/calendar-events', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ data: newEvent })
      })

      if (response.ok) {
        Swal.fire('Événement créé!')
        fetchEvents()
      } else {
        throw new Error('Erreur lors de la création de l\'événement')
      }
    } catch (error) {
      console.error('Erreur lors de la création de l\'événement :', error)
    }
  }

  return (
    <FullCalendar
      locale={frLocale}
      schedulerLicenseKey='CC-Attribution-NonCommercial-NoDerivatives'
      plugins={[
        dayGridPlugin,
        resourceTimelinePlugin,
        resourceTimeGridPlugin,
        interactionPlugin,
        timeGridPlugin,
        momentPlugin,
        listPlugin
      ]}
      headerToolbar={{
        left: 'prev,next today',
        center: 'dayGridMonth listMonth',
        right: 'title'
      }}
      events={events}
      eventColor='#2fb8c5'
      initialView='dayGridMonth' // Affichage de base
      editable // Pour activer les interactions d'events
      droppable // Pour activer le fait d'ajouter un élement via le drag&drop
      nowIndicator
      dayMaxEvents
      selectMirror
      height={850}
      selectable
      dayCellContent={renderDayCellContent}
      select={handleDateSelect}
      eventClick={handleEventClick}
    />
  )
}

function renderDayCellContent (dayCell) {
  const isToday = dayCell.isToday
  const dayCellStyle = isToday ? { backgroundColor: '#46c1ca', color: 'white' } : {}

  return (
    <div style={dayCellStyle} className='p-1 rounded-full'>
      <div className='rounded-full h-6 w-6 flex items-center justify-center' style={isToday ? { color: 'white' } : {}}>
        {dayCell.dayNumberText}
      </div>
    </div>
  )
}
