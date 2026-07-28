const instrumentsData = [
  {
    name: { ka: "ფორტეპიანო", en: "Piano" },
    category: "keyboard",
    type: { ka: "კლავიშიანი", en: "Keyboard" }
    ,categoryLabel: { ka: "კლავიშებიანი", en: "Keyboard" },
    era: { ka: "XVIII საუკუნე", en: "18th century" },
    description: { ka: "ბარტოლომეო კრისტოფორიმ შექმნა იტალიაში. მან რევოლუცია მოახდინა მუსიკაში ხმის დინამიკის (ფორტე/პიანო) რეგულირების შესაძლებლობით.", en: "ბარტოლომეო კრისტოფორიმ შექმნა იტალიაში. მან რევოლუცია მოახდინა მუსიკაში ხმის დინამიკის (ფორტე/პიანო) რეგულირების შესაძლებლობით." },
    imageUrl: "/images/piano.png",
    isFolk: false
  },
  {
    name: { ka: "ვიოლინო", en: "Violin" },
    category: "string",
    type: { ka: "სიმებიანი", en: "String" }
    ,categoryLabel: { ka: "სიმებიანი", en: "String" },
    era: { ka: "XVI საუკუნე", en: "16th century" },
    description: { ka: "სიმფონიური ორკესტრის წამყვანი საკრავი, რომელმაც თანამედროვე სახე იტალიაში, ანტონიო სტრადივარისა და გვარნერის ოსტატობით მიიღო.", en: "სიმფონიური ორკესტრის წამყვანი საკრავი, რომელმაც თანამედროვე სახე იტალიაში, ანტონიო სტრადივარისა და გვარნერის ოსტატობით მიიღო." },
    imageUrl: "/images/violin.png",
    isFolk: false
  },
  {
    name: { ka: "ფანდური", en: "Panduri" },
    category: "string",
    type: { ka: "სიმებიანი", en: "String" }
    ,categoryLabel: { ka: "სიმებიანი", en: "String" },
    era: { ka: "უხსოვარი დრო", en: "Ancient times" },
    description: { ka: "ქართული ხალხური სამსიმიანი საკრავი, გავრცელებული აღმოსავლეთ საქართველოში. გამოიყენება აკომპანემენტისა და საცეკვაო მელოდიებისთვის.", en: "ქართული ხალხური სამსიმიანი საკრავი, გავრცელებული აღმოსავლეთ საქართველოში. გამოიყენება აკომპანემენტისა და საცეკვაო მელოდიებისთვის." },
    imageUrl: "/images/fanduri.png",
    isFolk: true
  },
  {
    name: { ka: "ჩონგური", en: "Chonguri" },
    category: "string",
    type: { ka: "სიმებიანი", en: "String" }
    ,categoryLabel: { ka: "სიმებიანი", en: "String" },
    era: { ka: "უხსოვარი დრო", en: "Ancient times" },
    description: { ka: "დასავლეთ საქართველოს ტრადიციული ოთხსიმიანი საკრავი, გამოირჩევა ნაზი და ჰარმონიული ჟღერადობით.", en: "დასავლეთ საქართველოს ტრადიციული ოთხსიმიანი საკრავი, გამოირჩევა ნაზი და ჰარმონიული ჟღერადობით." },
    imageUrl: "/images/chonguri.png",
    isFolk: true
  },
  {
    name: { ka: "აკუსტიკური გიტარა", en: "Acoustic Guitar" },
    category: "string",
    type: { ka: "სიმებიანი", en: "String" }
    ,categoryLabel: { ka: "სიმებიანი", en: "String" },
    era: { ka: "XVI-XIX საუკუნე", en: "16th-19th century" },
    description: { ka: "მსოფლიოში ერთ-ერთი ყველაზე პოპულარული საკრავი, რომელიც გამოიყენება თითქმის ყველა მუსიკალურ ჟანრში — ფოლკიდან კლასიკამდე.", en: "მსოფლიოში ერთ-ერთი ყველაზე პოპულარული საკრავი, რომელიც გამოიყენება თითქმის ყველა მუსიკალურ ჟანრში — ფოლკიდან კლასიკამდე." },
    imageUrl: "/images/guitar.png",
    isFolk: false
  },
  {
    name: { ka: "ფლეიტა", en: "Flute" },
    category: "wind",
    type: { ka: "სასულე", en: "Wind" }
    ,categoryLabel: { ka: "სასულე", en: "Wind" },
    era: { ka: "ანტიკური ეპოქა", en: "Ancient era" },
    description: { ka: "კაცობრიობის ერთ-ერთი უძველესი მუსიკალური ინსტრუმენტი. თანამედროვე ორკესტრში გამოირჩევა მაღალი, ვირტუოზული ჟღერადობით.", en: "კაცობრიობის ერთ-ერთი უძველესი მუსიკალური ინსტრუმენტი. თანამედროვე ორკესტრში გამოირჩევა მაღალი, ვირტუოზული ჟღერადობით." },
    imageUrl: "/images/flute.png",
    isFolk: false
  },
  {
    name: { ka: "საქსოფონი", en: "Saxophone" },
    category: "wind",
    type: { ka: "სასულე", en: "Wind" }
    ,categoryLabel: { ka: "სასულე", en: "Wind" },
    era: { ka: "XIX საუკუნე (1846)", en: "19th century (1846)" },
    description: { ka: "ადოლფ საქსის მიერ გამოგონილი ინსტრუმენტი, რომელიც ჯაზის, ბლუზისა და თანამედროვე პოპ-მუსიკის განუყოფელ სიმბოლოდ იქცა.", en: "ადოლფ საქსის მიერ გამოგონილი ინსტრუმენტი, რომელიც ჯაზის, ბლუზისა და თანამედროვე პოპ-მუსიკის განუყოფელ სიმბოლოდ იქცა." },
    imageUrl: "/images/saxophone.png",
    isFolk: false
  },
  {
    name: { ka: "ჭიბონი (გუდაშტვირი)", en: "Chiboni (Bagpipe)" },
    category: "wind",
    type: { ka: "სასულე", en: "Wind" }
    ,categoryLabel: { ka: "სასულე", en: "Wind" },
    era: { ka: "უხსოვარი დრო", en: "Ancient times" },
    description: { ka: "ტრადიციული გუდიანი სასულე საკრავი, რომელიც გამოირჩევა მძლავრი, უწყვეტი და ტემპერამენტიანი ჟღერადობით.", en: "ტრადიციული გუდიანი სასულე საკრავი, რომელიც გამოირჩევა მძლავრი, უწყვეტი და ტემპერამენტიანი ჟღერადობით." },
    imageUrl: "/images/chiboni.png",
    isFolk: true
  },
  {
    name: { ka: "დრამ-კომპლექტი", en: "Drum Kit" },
    category: "percussion",
    type: { ka: "დასარტყამი", en: "Percussion" }
    ,categoryLabel: { ka: "დასარტყამი", en: "Percussion" },
    era: { ka: "XX საუკუნის დასაწყისი", en: "Early 20th century" },
    description: { ka: "თეფშებისა და დოლების კრებული, რომელიც როკ, ჯაზ და პოპ ჯგუფების რიტმულ ფუნდამენტს წარმოადგენს.", en: "თეფშებისა და დოლების კრებული, რომელიც როკ, ჯაზ და პოპ ჯგუფების რიტმულ ფუნდამენტს წარმოადგენს." },
    imageUrl: "/images/drumkit.png",
    isFolk: false
  },
  {
    name: { ka: "დოლი", en: "Doli" },
    category: "percussion",
    type: { ka: "დასარტყამი", en: "Percussion" }
    ,categoryLabel: { ka: "დასარტყამი", en: "Percussion" },
    era: { ka: "ძველი წელთაღრიცხვა", en: "Ancient times" },
    description: { ka: "ქართული ტრადიციული დასარტყამი ინსტრუმენტი, რომელიც რიტმულ საფუძველს ქმნის ხალხურ მუსიკასა და ცეკვაში.", en: "ქართული ტრადიციული დასარტყამი ინსტრუმენტი, რომელიც რიტმულ საფუძველს ქმნის ხალხურ მუსიკასა და ცეკვაში." },
    imageUrl: "/images/doli.png",
    isFolk: true
  },
  {
    name: { ka: "მარიმბა / ქსილოფონი", en: "Marimba / Xylophone" },
    category: "percussion",
    type: { ka: "დასარტყამი", en: "Percussion" }
    ,categoryLabel: { ka: "დასარტყამი", en: "Percussion" },
    era: { ka: "XIV საუკუნე", en: "14th century" },
    description: { ka: "დასარტყამი მელოდიური ინსტრუმენტი ხის ფირფიტებითა და რეზონატორი მილებით, რომელიც მდიდარ და თბილ ბგერას გამოსცემს.", en: "დასარტყამი მელოდიური ინსტრუმენტი ხის ფირფიტებითა და რეზონატორი მილებით, რომელიც მდიდარ და თბილ ბგერას გამოსცემს." },
    imageUrl: "/images/marimba.png",
    isFolk: false
  },
  {
    name: { ka: "ელექტროგიტარა", en: "Electric Guitar" },
    category: "electronic",
    type: { ka: "ელექტრონული", en: "Electronic" }
    ,categoryLabel: { ka: "ელექტრონული", en: "Electronic" },
    era: { ka: "XX საუკუნე (1930-იანები)", en: "20th century (1930s)" },
    description: { ka: "ხმის ელექტრონული გაძლიერების ტექნოლოგიამ სათავე დაუდო როკ-ენ-როლის, ჯაზისა და თანამედროვე მუსიკის ეპოქას.", en: "ხმის ელექტრონული გაძლიერების ტექნოლოგიამ სათავე დაუდო როკ-ენ-როლის, ჯაზისა და თანამედროვე მუსიკის ეპოქას." },
    imageUrl: "/images/electric_guitar.png",
    isFolk: false
  },
  {
    name: { ka: "სინთეზატორი", en: "Synthesizer" },
    category: "electronic",
    type: { ka: "ელექტრონული", en: "Electronic" }
    ,categoryLabel: { ka: "ელექტრონული", en: "Electronic" },
    era: { ka: "XX საუკუნე (1960-იანები)", en: "20th century (1960s)" },
    description: { ka: "ელექტრონული ინსტრუმენტი, რომელსაც შეუძლია ნებისმიერი ხმის სიმულირება ან სრულიად ახალი, ციფრული ჟღერადობების გენერირება.", en: "ელექტრონული ინსტრუმენტი, რომელსაც შეუძლია ნებისმიერი ხმის სიმულირება ან სრულიად ახალი, ციფრული ჟღერადობების გენერირება." },
    imageUrl: "/images/synth.png",
    isFolk: false
  }
];

export default instrumentsData;