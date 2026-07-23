const instrumentsData = [
  {
    name: "ფორტეპიანო",
    category: "keyboard",
    type: "კლავიშიანი",
    era: "XVIII საუკუნე",
    description: "ბარტოლომეო კრისტოფორიმ შექმნა იტალიაში. მან რევოლუცია მოახდინა მუსიკაში ხმის დინამიკის (ფორტე/პიანო) რეგულირების შესაძლებლობით.",
    imageUrl: "/images/piano.png",
    isFolk: false
  },
  {
    name: "ვიოლინო",
    category: "string",
    type: "სიმებიანი",
    era: "XVI საუკუნე",
    description: "სიმფონიური ორკესტრის წამყვანი საკრავი, რომელმაც თანამედროვე სახე იტალიაში, ანტონიო სტრადივარისა და გვარნერის ოსტატობით მიიღო.",
    imageUrl: "/images/violin.png",
    isFolk: false
  },
  {
    name: "ფანდური",
    category: "string",
    type: "სიმებიანი",
    era: "უხსოვარი დრო",
    description: "ქართული ხალხური სამსიმიანი საკრავი, გავრცელებული აღმოსავლეთ საქართველოში. გამოიყენება აკომპანემენტისა და საცეკვაო მელოდიებისთვის.",
    imageUrl: "/images/fanduri.png",
    isFolk: true
  },
  {
    name: "ჩონგური",
    category: "string",
    type: "სიმებიანი",
    era: "უხსოვარი დრო",
    description: "დასავლეთ საქართველოს ტრადიციული ოთხსიმიანი საკრავი, გამოირჩევა ნაზი და ჰარმონიული ჟღერადობით.",
    imageUrl: "/images/chonguri.png",
    isFolk: true
  },
  {
    name: "აკუსტიკური გიტარა",
    category: "string",
    type: "სიმებიანი",
    era: "XVI-XIX საუკუნე",
    description: "მსოფლიოში ერთ-ერთი ყველაზე პოპულარული საკრავი, რომელიც გამოიყენება თითქმის ყველა მუსიკალურ ჟანრში — ფოლკიდან კლასიკამდე.",
    imageUrl: "/images/guitar.png",
    isFolk: false
  },
  {
    name: "ფლეიტა",
    category: "wind",
    type: "სასულე",
    era: "ანტიკური ეპოქა",
    description: "კაცობრიობის ერთ-ერთი უძველესი მუსიკალური ინსტრუმენტი. თანამედროვე ორკესტრში გამოირჩევა მაღალი, ვირტუოზული ჟღერადობით.",
    imageUrl: "/images/flute.png",
    isFolk: false
  },
  {
    name: "საქსოფონი",
    category: "wind",
    type: "სასულე",
    era: "XIX საუკუნე (1846)",
    description: "ადოლფ საქსის მიერ გამოგონილი ინსტრუმენტი, რომელიც ჯაზის, ბლუზისა და თანამედროვე პოპ-მუსიკის განუყოფელ სიმბოლოდ იქცა.",
    imageUrl: "/images/saxophone.png",
    isFolk: false
  },
  {
    name: "ჭიბონი (გუდაშტვირი)",
    category: "wind",
    type: "სასულე",
    era: "უხსოვარი დრო",
    description: "ტრადიციული გუდიანი სასულე საკრავი, რომელიც გამოირჩევა მძლავრი, უწყვეტი და ტემპერამენტიანი ჟღერადობით.",
    imageUrl: "/images/chiboni.png",
    isFolk: true
  },
  {
    name: "დრამ-კომპლექტი",
    category: "percussion",
    type: "დასარტყამი",
    era: "XX საუკუნის დასაწყისი",
    description: "თეფშებისა და დოლების კრებული, რომელიც როკ, ჯაზ და პოპ ჯგუფების რიტმულ ფუნდამენტს წარმოადგენს.",
    imageUrl: "/images/drumkit.png",
    isFolk: false
  },
  {
    name: "დოლი",
    category: "percussion",
    type: "დასარტყამი",
    era: "ძველი წელთაღრიცხვა",
    description: "ქართული ტრადიციული დასარტყამი ინსტრუმენტი, რომელიც რიტმულ საფუძველს ქმნის ხალხურ მუსიკასა და ცეკვაში.",
    imageUrl: "/images/doli.png",
    isFolk: true
  },
  {
    name: "მარიმბა / ქსილოფონი",
    category: "percussion",
    type: "დასარტყამი",
    era: "XIV საუკუნე",
    description: "დასარტყამი მელოდიური ინსტრუმენტი ხის ფირფიტებითა და რეზონატორი მილებით, რომელიც მდიდარ და თბილ ბგერას გამოსცემს.",
    imageUrl: "/images/marimba.png",
    isFolk: false
  },
  {
    name: "ელექტროგიტარა",
    category: "electronic",
    type: "ელექტრონული",
    era: "XX საუკუნე (1930-იანები)",
    description: "ხმის ელექტრონული გაძლიერების ტექნოლოგიამ სათავე დაუდო როკ-ენ-როლის, ჯაზისა და თანამედროვე მუსიკის ეპოქას.",
    imageUrl: "/images/electric_guitar.png",
    isFolk: false
  },
  {
    name: "სინთეზატორი",
    category: "electronic",
    type: "ელექტრონული",
    era: "XX საუკუნე (1960-იანები)",
    description: "ელექტრონული ინსტრუმენტი, რომელსაც შეუძლია ნებისმიერი ხმის სიმულირება ან სრულიად ახალი, ციფრული ჟღერადობების გენერირება.",
    imageUrl: "/images/synth.png",
    isFolk: false
  }
];

export default instrumentsData;