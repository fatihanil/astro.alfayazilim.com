---
enable: true
badge: "iletişim"
title: "Aklınızda bir proje mi var? <br /> Konuşalım."
description: "Uzman yardımı arıyor olun ya da olmayın, özel ekibimiz her adımda size destek olmaya hazır."
image: "/images/contact-home.jpg"
imageAlt: "İletişim"
characterImage: "/images/character-3d.png"
characterImageAlt: "3D karakter"

form:
  emailSubject: "Yeni iletişim formu gönderimi"
  submitButton:
    enable: true
    label: "Mesaj Gönder"
  inputs:
    - label: "Ad Soyad"
      placeholder: "Ad Soyad *"
      name: "Full Name"
      required: true
      halfWidth: true
      defaultValue: ""
    - label: "E-posta Adresi"
      placeholder: "E-posta Adresi *"
      name: "Email Address"
      required: true
      type: "email"
      halfWidth: true
      defaultValue: ""
    - label: "Telefon Numarası"
      placeholder: "Telefon Numarası"
      name: "Phone Number"
      required: false
      type: "text"
      halfWidth: true
      defaultValue: ""
    - label: "Şirket"
      placeholder: "Şirket"
      name: "Company"
      required: false
      type: "text"
      halfWidth: true
      defaultValue: ""
    - label: "Konu"
      placeholder: "Konu *"
      name: "Subject"
      required: true
      halfWidth: true
      dropdown:
        type: "select"
        items:
          - label: "Web Geliştirme"
            value: "Web Development"
            selected: false
          - label: "Uygulama Geliştirme"
            value: "App Development"
            selected: false
          - label: "UI/UX Tasarım"
            value: "UI/UX Design"
            selected: false
          - label: "Diğer"
            value: "Other"
            selected: false
    - label: "İlgili Departman"
      placeholder: "Departman Seçin *"
      name: "Department Search"
      required: true
      halfWidth: true
      dropdown:
        type: "search"
        search:
          placeholder: "Departman Ara..."
        items:
          - label: "Müşteri Desteği"
            value: "Customer Support"
            selected: false
          - label: "Satış ve Finans"
            value: "Sales & Finance"
            selected: false
          - label: "Teknik Destek"
            value: "Technical Assistance"
            selected: false
          - label: "İş Ortaklıkları"
            value: "Partnerships"
            selected: false
    - label: "Mesaj"
      tag: "textarea"
      placeholder: "Sorunuzu yazın *"
      name: "Message"
      required: true
      halfWidth: false
      rows: "4"
      defaultValue: ""
    - label: "Google Arama"
      checked: false
      name: "User Source"
      required: true
      groupLabel: "Bizi nasıl duydunuz?"
      group: "source"
      type: "radio"
      halfWidth: true
      defaultValue: ""
    - label: "Sosyal Medya"
      name: "User Source"
      required: true
      group: "source"
      type: "radio"
      halfWidth: true
      defaultValue: ""
    - label: "Tavsiye"
      name: "User Source"
      required: true
      group: "source"
      type: "radio"
      halfWidth: true
      defaultValue: ""
    - label: "[Kullanım Koşulları](/)'nı kabul ediyorum"
      name: "Agreed Privacy"
      value: "Agreed"
      checked: false
      required: true
      type: "checkbox"
      halfWidth: false
      defaultValue: ""
    - note: success
      parentClass: "hidden text-sm message success"
      content: "Mesajınızı aldık! En kısa sürede size geri döneceğiz."
    - note: deprecated
      parentClass: "hidden text-sm message error"
      content: "Bir şeyler yanlış gitti! Lütfen tekrar deneyin."
---
