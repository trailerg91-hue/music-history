export function getAdminUi({ t, isEnglish, isMainAdmin }) {
  const action = isEnglish ? 'Action' : 'მოქმედება';
  return {
    tabs: [
      { id: 'users', label: t.admin.users },
      { id: 'epochs', label: t.admin.epochs },
      { id: 'instruments', label: t.admin.instruments },
      { id: 'folk', label: t.admin.folklore },
    ],
    userOnlyMainAdmin: isEnglish
      ? 'Only the main administrator can grant or remove admin status.'
      : 'მხოლოდ მთავარ ადმინისტრატორს შეუძლია ადმინის სტატუსის მინიჭება ან მოხსნა!',
    userStatusFailed: isEnglish ? 'Status could not be changed' : 'სტატუსი ვერ შეიცვალა',
    userDeleteDenied: isEnglish
      ? 'Only the main administrator can delete users.'
      : 'მხოლოდ მთავარ ადმინისტრატორს შეუძლია მომხმარებლების წაშლა!',
    recordDeleteDenied: isEnglish
      ? 'Only the main administrator can delete records.'
      : 'მხოლოდ მთავარ ადმინისტრატორს შეუძლია ჩანაწერების წაშლა!',
    selectedFile: isEnglish ? 'Selected' : 'არჩეულია',
    studioLabel: isEnglish ? 'Content studio' : 'კონტენტ სტუდია',
    studioHint: isEnglish
      ? 'Manage site content from one place.'
      : 'მართე საიტის კონტენტი ერთი ადგილიდან.',
    searchPlaceholder: isEnglish ? 'Search…' : 'ძებნა…',
    addNew: isEnglish ? '+ Add' : '+ დამატება',
    close: isEnglish ? 'Close' : 'დახურვა',
    emptySearch: isEnglish ? 'No matches found.' : 'შედეგი ვერ მოიძებნა.',
    emptyUsers: isEnglish ? 'No users yet.' : 'მომხმარებლები ჯერ არ არის.',
    folkBadge: isEnglish ? 'Folk' : 'ფოლკლორი',
    usersTitle: isEnglish ? 'Registered users' : 'რეგისტრირებული მომხმარებლები',
    usersHeaders: [
      'ID',
      isEnglish ? 'Name / Email' : 'სახელი / მეილი',
      isEnglish ? 'Status' : 'სტატუსი',
      ...(isMainAdmin ? [isEnglish ? 'Admin control' : 'ადმინის მართვა', action] : []),
    ],
    adminLabel: isEnglish ? 'Admin' : 'ადმინი',
    userLabel: isEnglish ? 'User' : 'მომხმარებელი',
    revokeAdmin: isEnglish ? 'Remove admin' : 'სტატუსის მოხსნა',
    grantAdmin: isEnglish ? 'Make admin' : 'ადმინად მინიჭება',
    delete: t.common.delete,
    addEpoch: isEnglish ? 'Add new era' : 'ახალი ეპოქის დამატება',
    eraLabel: isEnglish ? 'Era' : 'ეპოქა',
    yearRangeLabel: isEnglish ? 'Year range' : 'წლების დიაპაზონი',
    eraDescriptionLabel: isEnglish ? 'Era description' : 'ეპოქის აღწერა',
    countryNameLabel: isEnglish ? 'Country name' : 'ქვეყნის სახელი',
    countrySummaryLabel: isEnglish ? 'Country summary' : 'ქვეყნის აღწერა',
    celebrationLabel: isEnglish ? 'Golden age' : 'ოქროს ხანა',
    warLabel: isEnglish ? 'Wartime' : 'საომარი',
    mourningLabel: isEnglish ? 'Mourning' : 'სამგლოვიარო',
    eraImage: isEnglish ? 'Era image:' : 'ეპოქის სურათი:',
    imageFromComputer: isEnglish ? '📁 Choose image from computer' : '📁 აირჩიეთ სურათი კომპიუტერიდან',
    imageUrlPlaceholder: isEnglish ? 'Paste image URL...' : 'ჩააკოპირეთ სურათის URL ლინკი...',
    audioSample: isEnglish ? 'Music audio sample:' : 'მუსიკალური აუდიო ნიმუში:',
    audioFromComputer: isEnglish ? '📁 Choose audio from computer' : '📁 აირჩიეთ აუდიო კომპიუტერიდან',
    audioUrlPlaceholder: isEnglish ? 'Paste audio URL...' : 'ჩააკოპირეთ აუდიოს URL ლინკი...',
    audioFileBtn: isEnglish ? '📁 Audio file' : '📁 აუდიო ფაილიდან',
    audioLinkBtn: isEnglish ? '🔗 Audio link' : '🔗 აუდიო ლინკით',
    addEraBtn: isEnglish ? 'Add era' : 'ეპოქის დამატება',
    autoTranslateReady: isEnglish
      ? 'Fill in Georgian only. English will be generated automatically on save via {provider}.'
      : 'შეავსე მხოლოდ ქართული ველები. შენახვისას English ავტომატურად გენერირდება {provider}-ით.',
    autoTranslateOffline: isEnglish
      ? 'Free offline mode is active: known terms are translated and short names are transliterated automatically. Long descriptions may stay in Georgian.'
      : 'ჩართულია უფასო offline რეჟიმი: ცნობილი ტერმინები ითარგმნება, მოკლე სახელები კი ავტომატურად ტრანსლიტერირდება. გრძელი აღწერები შეიძლება ქართულად დარჩეს.',
    autoTranslateMissing: isEnglish
      ? 'Auto-translation is currently disabled on the server. Add a Gemini or OpenAI API key, or enter English manually.'
      : 'ავტომატური თარგმანი ამჟამად გამორთულია სერვერზე. დაამატე Gemini ან OpenAI API key, ან English ხელით შეავსე.',
    autoTranslateChecking: isEnglish
      ? 'Checking auto-translation status...'
      : 'ვამოწმებ ავტომატური თარგმანის სტატუსს...',
    existingEras: isEnglish ? 'Existing eras on the site' : 'საიტზე არსებული ეპოქები',
    erasHeaders: [
      isEnglish ? 'Era' : 'ეპოქა',
      isEnglish ? 'Year range' : 'წლების დიაპაზონი',
      isEnglish ? 'Countries' : 'ქვეყნები',
      ...(isMainAdmin ? [action] : []),
    ],
    noCountries: isEnglish ? 'No countries' : 'ქვეყნები არ არის',
    addInstrument: isEnglish ? 'Add new instrument' : 'ახალი საკრავის დამატება',
    instrumentNameLabel: isEnglish ? 'Instrument name' : 'საკრავის სახელი',
    chooseCategory: isEnglish ? 'Choose category:' : 'აირჩიეთ კატეგორია:',
    typeLabel: isEnglish ? 'Type' : 'ტიპი',
    categoryLabel: isEnglish ? 'Category label' : 'კატეგორიის წარწერა',
    instrumentImage: isEnglish ? 'Instrument image:' : 'საკრავის სურათი:',
    folkInstrumentQuestion: isEnglish
      ? 'Is this a Georgian folk instrument?'
      : 'არის თუ არა ქართული ფოლკლორული საკრავი?',
    descriptionLabel: isEnglish ? 'Description' : 'აღწერა',
    addInstrumentBtn: isEnglish ? 'Add instrument' : 'საკრავის დამატება',
    existingInstruments: isEnglish ? 'Existing instruments on the site' : 'საიტზე არსებული საკრავები',
    instrumentsHeaders: [
      isEnglish ? 'Name' : 'სახელი',
      isEnglish ? 'Type' : 'ტიპი',
      isEnglish ? 'Folk?' : 'ფოლკლორია?',
      ...(isMainAdmin ? [action] : []),
    ],
    addFolklore: isEnglish ? 'Add new region / folklore' : 'ახალი რეგიონის / ფოლკლორის დამატება',
    folkloreTitleLabel: isEnglish ? 'Title' : 'სათაური',
    folkloreTagLabel: isEnglish ? 'Tag' : 'თეგი',
    folkloreImage: isEnglish ? 'Folklore image:' : 'ფოლკლორის სურათი:',
    addFolkloreBtn: isEnglish ? 'Add folklore' : 'ფოლკლორის დამატება',
    folkloreRegionsTitle: isEnglish ? 'Georgian folklore regions' : 'ქართული ფოლკლორის რეგიონები',
    folkloreHeaders: [
      isEnglish ? 'Title' : 'სათაური',
      isEnglish ? 'Tag' : 'თეგი',
      isEnglish ? 'Description' : 'აღწერა',
      ...(isMainAdmin ? [action] : []),
    ],
    yes: t.common.yes,
    no: t.common.no,
    fileBtn: t.common.file,
    linkBtn: t.common.link,
  };
}
