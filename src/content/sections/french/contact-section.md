---
enable: true
badge: "contact"
title: "Un projet en tete ? <br /> Parlons-en."
description: "Que vous recherchiez une expertise ponctuelle ou un accompagnement complet, notre equipe est prete a vous aider a chaque etape."
image: "/images/contact-home.jpg"
imageAlt: "Contact"
characterImage: "/images/character-3d.png"
characterImageAlt: "Personnage 3D"

form:
  emailSubject: "Nouvelle soumission du formulaire de contact"
  submitButton:
    enable: true
    label: "Envoyer un message"
  inputs:
    - label: "Nom complet"
      placeholder: "Nom complet *"
      name: "Nom complet"
      required: true
      halfWidth: true
      defaultValue: ""
    - label: "Adresse e-mail"
      placeholder: "Adresse e-mail *"
      name: "Adresse e-mail"
      required: true
      type: "email"
      halfWidth: true
      defaultValue: ""
    - label: "Numero de telephone"
      placeholder: "Numero de telephone"
      name: "Numero de telephone"
      required: false
      type: "text"
      halfWidth: true
      defaultValue: ""
    - label: "Entreprise"
      placeholder: "Entreprise"
      name: "Entreprise"
      required: false
      type: "text"
      halfWidth: true
      defaultValue: ""
    - label: "Sujet"
      placeholder: "Sujet"
      name: "Sujet"
      required: true
      halfWidth: true
      dropdown:
        type: "select"
        items:
          - label: "Developpement web"
            value: "Developpement web"
          - label: "Developpement d'applications"
            value: "Developpement d'applications"
          - label: "Design UI/UX"
            value: "Design UI/UX"
          - label: "Autre"
            value: "Autre"
    - label: "Departement concerne"
      placeholder: "Selectionner un departement"
      name: "Recherche de departement"
      required: true
      halfWidth: true
      dropdown:
        type: "search"
        search:
          placeholder: "Rechercher un departement..."
        items:
          - label: "Support client"
            value: "Support client"
          - label: "Ventes et finance"
            value: "Ventes et finance"
          - label: "Assistance technique"
            value: "Assistance technique"
          - label: "Partenariats"
            value: "Partenariats"
    - label: "Message"
      tag: "textarea"
      placeholder: "Posez votre question"
      name: "Message"
      required: true
      halfWidth: false
      rows: "4"
      defaultValue: ""
    - label: "Recherche Google"
      checked: false
      name: "Source utilisateur"
      required: true
      groupLabel: "Comment avez-vous entendu parler de nous ?"
      group: "source"
      type: "radio"
      halfWidth: true
      defaultValue: ""
    - label: "Reseaux sociaux"
      name: "Source utilisateur"
      required: true
      group: "source"
      type: "radio"
      halfWidth: true
      defaultValue: ""
    - label: "Recommandation"
      name: "Source utilisateur"
      required: true
      group: "source"
      type: "radio"
      halfWidth: true
      defaultValue: ""
    - label: "J'accepte les termes et conditions"
      name: "Consentement"
      value: "Accepte"
      checked: false
      required: true
      type: "checkbox"
      halfWidth: false
      defaultValue: ""
    - note: success
      parentClass: "hidden text-sm message success"
      content: "Nous avons bien recu votre message ! Nous vous repondrons des que possible."
    - note: deprecated
      parentClass: "hidden text-sm message error"
      content: "Une erreur s'est produite ! Veuillez reessayer."
---
