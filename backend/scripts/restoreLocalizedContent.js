import dotenv from 'dotenv';
import mongoose from 'mongoose';
import path from 'path';
import { fileURLToPath } from 'url';
import Folklore from '../models/Folklore.js';
import History from '../models/History.js';
import Instrument from '../models/Instrument.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, '..', '.env') });
dotenv.config({ path: path.join(__dirname, '..', '..', '.env') });

const loc = (ka, en) => ({ ka, en });

const instrumentsByImage = {
  '/images/piano.png': {
    name: loc('ფორტეპიანო', 'Piano'),
    categoryLabel: loc('კლავიშებიანი', 'Keyboard'),
    type: loc('კლავიშიანი', 'Keyboard'),
    era: loc('XVIII საუკუნე', '18th century'),
    description: loc(
      'იტალიაში შექმნილი ინსტრუმენტი, რომელმაც მუსიკაში დინამიკის მართვა სრულიად ახალ დონეზე აიყვანა.',
      'An instrument created in Italy that transformed music by allowing nuanced control of dynamics.'
    ),
  },
  '/images/violin.png': {
    name: loc('ვიოლინო', 'Violin'),
    categoryLabel: loc('სიმებიანი', 'String'),
    type: loc('სიმებიანი', 'String'),
    era: loc('XVI საუკუნე', '16th century'),
    description: loc(
      'სიმფონიური ორკესტრის წამყვანი საკრავი, რომლის თანამედროვე ფორმა იტალიელი ოსტატების ხელში ჩამოყალიბდა.',
      'A leading orchestral instrument whose modern form was refined by Italian master makers.'
    ),
  },
  '/images/fanduri.png': {
    name: loc('ფანდური', 'Panduri'),
    categoryLabel: loc('სიმებიანი', 'String'),
    type: loc('სიმებიანი', 'String'),
    era: loc('უხსოვარი დრო', 'Ancient times'),
    description: loc(
      'ქართული სამსიმიანი ხალხური საკრავი, განსაკუთრებით გავრცელებული აღმოსავლეთ საქართველოში.',
      'A traditional three-string Georgian folk instrument, especially common in eastern Georgia.'
    ),
  },
  '/images/chonguri.png': {
    name: loc('ჩონგური', 'Chonguri'),
    categoryLabel: loc('სიმებიანი', 'String'),
    type: loc('სიმებიანი', 'String'),
    era: loc('უხსოვარი დრო', 'Ancient times'),
    description: loc(
      'დასავლეთ საქართველოს ოთხსიმიანი საკრავი, რომელიც ნაზი და ჰარმონიული ჟღერადობით გამოირჩევა.',
      'A four-string instrument from western Georgia known for its soft and harmonious tone.'
    ),
  },
  '/images/guitar.png': {
    name: loc('აკუსტიკური გიტარა', 'Acoustic Guitar'),
    categoryLabel: loc('სიმებიანი', 'String'),
    type: loc('სიმებიანი', 'String'),
    era: loc('XVI-XIX საუკუნე', '16th-19th century'),
    description: loc(
      'მსოფლიოში ერთ-ერთი ყველაზე პოპულარული საკრავი, რომელიც მრავალ ჟანრში გამოიყენება.',
      'One of the most popular instruments in the world, used across a wide range of genres.'
    ),
  },
  '/images/flute.png': {
    name: loc('ფლეიტა', 'Flute'),
    categoryLabel: loc('სასულე', 'Wind'),
    type: loc('სასულე', 'Wind'),
    era: loc('ანტიკური ეპოქა', 'Ancient era'),
    description: loc(
      'კაცობრიობის ერთ-ერთი უძველესი საკრავი, რომელიც თანამედროვე ორკესტრში ნათელი ტემბრით ჟღერს.',
      'One of humanity\'s oldest instruments, prized in the modern orchestra for its bright timbre.'
    ),
  },
  '/images/saxophone.png': {
    name: loc('საქსოფონი', 'Saxophone'),
    categoryLabel: loc('სასულე', 'Wind'),
    type: loc('სასულე', 'Wind'),
    era: loc('XIX საუკუნე (1846)', '19th century (1846)'),
    description: loc(
      'ადოლფ საქსის მიერ გამოგონილი ინსტრუმენტი, რომელიც ჯაზისა და თანამედროვე პოპულარული მუსიკის სიმბოლოდ იქცა.',
      'An instrument invented by Adolphe Sax that became a symbol of jazz and modern popular music.'
    ),
  },
  '/images/chiboni.png': {
    name: loc('ჭიბონი (გუდაშტვირი)', 'Chiboni (Bagpipe)'),
    categoryLabel: loc('სასულე', 'Wind'),
    type: loc('სასულე', 'Wind'),
    era: loc('უხსოვარი დრო', 'Ancient times'),
    description: loc(
      'ტრადიციული გუდიანი სასულე საკრავი, ძლიერი და უწყვეტი ხმოვანებით.',
      'A traditional bagpipe-style wind instrument with a strong, continuous sound.'
    ),
  },
  '/images/drumkit.png': {
    name: loc('დრამ-კომპლექტი', 'Drum Kit'),
    categoryLabel: loc('დასარტყამი', 'Percussion'),
    type: loc('დასარტყამი', 'Percussion'),
    era: loc('XX საუკუნის დასაწყისი', 'Early 20th century'),
    description: loc(
      'თეფშებისა და დოლების კრებული, რომელიც თანამედროვე ბენდების რიტმულ საფუძველს ქმნის.',
      'A set of drums and cymbals that provides the rhythmic foundation of modern bands.'
    ),
  },
  '/images/doli.png': {
    name: loc('დოლი', 'Doli'),
    categoryLabel: loc('დასარტყამი', 'Percussion'),
    type: loc('დასარტყამი', 'Percussion'),
    era: loc('ძველი წელთაღრიცხვა', 'Ancient times'),
    description: loc(
      'ქართული ტრადიციული დასარტყამი ინსტრუმენტი, რომელიც ხალხურ მუსიკასა და ცეკვაში რიტმულ ბირთვს ქმნის.',
      'A traditional Georgian percussion instrument that provides the rhythmic core of folk music and dance.'
    ),
  },
  '/images/marimba.png': {
    name: loc('მარიმბა / ქსილოფონი', 'Marimba / Xylophone'),
    categoryLabel: loc('დასარტყამი', 'Percussion'),
    type: loc('დასარტყამი', 'Percussion'),
    era: loc('XIV საუკუნე', '14th century'),
    description: loc(
      'ხის ფირფიტებით შექმნილი მელოდიური დასარტყამი საკრავი თბილი და მდიდარი ჟღერადობით.',
      'A melodic percussion instrument with wooden bars, known for its warm and resonant sound.'
    ),
  },
  '/images/electric_guitar.png': {
    name: loc('ელექტროგიტარა', 'Electric Guitar'),
    categoryLabel: loc('ელექტრონული', 'Electronic'),
    type: loc('ელექტრონული', 'Electronic'),
    era: loc('XX საუკუნე (1930-იანები)', '20th century (1930s)'),
    description: loc(
      'ელექტრონულად გაძლიერებულმა ხმამ როკისა და თანამედროვე სცენის ახალი ერა შექმნა.',
      'Its amplified sound helped define the era of rock and much of the modern stage.'
    ),
  },
  '/images/synth.png': {
    name: loc('სინთეზატორი', 'Synthesizer'),
    categoryLabel: loc('ელექტრონული', 'Electronic'),
    type: loc('ელექტრონული', 'Electronic'),
    era: loc('XX საუკუნე (1960-იანები)', '20th century (1960s)'),
    description: loc(
      'ელექტრონული ინსტრუმენტი, რომელსაც შეუძლია როგორც არსებული, ისე სრულიად ახალი ხმების შექმნა.',
      'An electronic instrument capable of recreating familiar sounds or generating entirely new ones.'
    ),
  },
  'http://localhost:5000/uploads/1784796183738.png': {
    name: loc('უკულელე', 'Ukulele'),
    categoryLabel: loc('სიმებიანი', 'String'),
    type: loc('სიმებიანი', 'String'),
    era: loc('XIX საუკუნე', '19th century'),
    description: loc(
      'პატარა ზომის ოთხსიმიანი საკრავი, თბილი და მსუბუქი ჟღერადობით.',
      'A compact four-string instrument known for its warm and light sound.'
    ),
  },
};

const folkloreById = {
  racha: {
    title: loc('რაჭული ფოლკლორი', 'Rachan Folklore'),
    tag: loc('მთის სევდა და ძალა', 'Mountain melancholy and strength'),
    description: loc(
      'რაჭის ფოლკლორი მშვიდ, სიღრმისეულ და ლირიკულ ხასიათს ატარებს. სიმღერებში იგრძნობა მთის ბუნება, შინაგანი სითბო და გმირული ტონი.',
      'Racha\'s folklore carries a calm, lyrical, and inward-looking character shaped by the mountains, warmth, and a heroic tone.'
    ),
  },
  megrelia: {
    title: loc('მეგრული ფოლკლორი', 'Mingrelian Folklore'),
    tag: loc('ენერგია და პოლიფონია', 'Energy and polyphony'),
    description: loc(
      'სამეგრელოს მუსიკას ახასიათებს სწრაფი ტემპი, გამომსახველი ხმოვანება და ძლიერი გუნდური ტრადიცია.',
      'Mingrelian music is marked by lively tempo, expressive sonority, and a strong choral tradition.'
    ),
  },
  svaneti: {
    title: loc('სვანური ფოლკლორი', 'Svan Folklore'),
    tag: loc('არქაული მრავალხმიანობა', 'Archaic polyphony'),
    description: loc(
      'სვანური სიმღერები ერთ-ერთი უძველესი ფენაა ქართულ მუსიკაში, მკაცრი, მონუმენტური და ძლიერ რიტუალური ჟღერადობით.',
      'Svan songs preserve one of the oldest layers of Georgian music, with monumental and ritual-rich textures.'
    ),
  },
  kakheti: {
    title: loc('კახური ფოლკლორი', 'Kakhetian Folklore'),
    tag: loc('სუფრა, შრომა და სიმღერა', 'Feasts, labor, and song'),
    description: loc(
      'კახური ტრადიცია გამოირჩევა გაბმული მელოდიებით, ვრცელ ხმოვან სივრცით და სუფრის სიმღერების განსაკუთრებული კულტურით.',
      'Kakhetian tradition stands out for its extended melodic lines, open vocal space, and rich feast-song culture.'
    ),
  },
  imereti: {
    title: loc('იმერული ფოლკლორი', 'Imeretian Folklore'),
    tag: loc('ლირიკა და მოქნილობა', 'Lyricism and agility'),
    description: loc(
      'იმერული ფოლკლორი მსუბუქი, მელოდიური და მოქნილი ინტონაციებით გამოირჩევა, სადაც სიხარული და სინაზე თანაბრად იგრძნობა.',
      'Imeretian folklore is melodic and agile, balancing brightness with tenderness.'
    ),
  },
  'samtskhe-javakheti': {
    title: loc('სამცხე-ჯავახეთის ფოლკლორი', 'Samtskhe-Javakheti Folklore'),
    tag: loc('საზღვრისპირა ხმები', 'Borderland voices'),
    description: loc(
      'სამცხე-ჯავახეთის მუსიკალურ ტრადიციაში იკვეთება მრავალფეროვანი გავლენები და მკაფიო, დამახასიათებელი მელოდიური ხაზი.',
      'The musical tradition of Samtskhe-Javakheti blends diverse influences with a clear and distinctive melodic line.'
    ),
  },
  adjara: {
    title: loc('აჭარული ფოლკლორი', 'Adjarian Folklore'),
    tag: loc('ზღვა, ცეკვა და იმპულსი', 'Sea, dance, and impulse'),
    description: loc(
      'აჭარულ ფოლკლორში ერთმანეთს ერწყმის ზღვისპირა ხასიათი, საცეკვაო ენერგია და ნათელი ემოციური ფერი.',
      'Adjarian folklore combines a coastal character with dance energy and vivid emotional color.'
    ),
  },
  khevsureti: {
    title: loc('ხევსურული ფოლკლორი', 'Khevsur Folklore'),
    tag: loc('გმირული და მკაცრი', 'Heroic and austere'),
    description: loc(
      'ხევსურული ტრადიცია გამორჩეულია მკვეთრი რიტმით, საბრძოლო განწყობით და მთის ხალხის ღირსების შეგრძნებით.',
      'Khevsur tradition is notable for sharp rhythm, martial spirit, and a strong sense of mountain honor.'
    ),
  },
  afxazeti: {
    title: loc('აფხაზეთის ფოლკლორი', 'Abkhazian Folklore'),
    tag: loc('ზღვისპირა მრავალხმიანობა', 'Coastal polyphony'),
    description: loc(
      'აფხაზეთის ფოლკლორში ისმის ზღვისპირა ხასიათი, ფართო ჟღერადობა და მრავალხმიანობის მდიდარი შრეები.',
      'Abkhazian folklore carries a coastal atmosphere, broad sonority, and rich layers of polyphony.'
    ),
  },
  guria: {
    title: loc('გურული ფოლკლორი', 'Gurian Folklore'),
    tag: loc('კრიმანჭული და სისწრაფე', 'Krimanchuli and speed'),
    description: loc(
      'გურული სიმღერა ცნობილია სწრაფი მოძრაობით, მახვილი რიტმით და კრიმანჭულის უნიკალური ტემბრით.',
      'Gurian song is famous for its speed, bright rhythm, and the unique timbre of krimanchuli.'
    ),
  },
  'shida-qartli': {
    title: loc('შიდა ქართლის ფოლკლორი', 'Shida Kartli Folklore'),
    tag: loc('სიდინჯე და ეპიკურობა', 'Calmness and epic character'),
    description: loc(
      'შიდა ქართლის ტრადიციაში იგრძნობა სიდინჯე, გამოკვეთილი მელოდიურობა და ძველი ქართული სიმღერის ეპიკური სული.',
      'The tradition of Shida Kartli reflects calmness, clear melodicism, and an epic Georgian spirit.'
    ),
  },
  'qvemo-qartli': {
    title: loc('ქვემო ქართლის ფოლკლორი', 'Kvemo Kartli Folklore'),
    tag: loc('მრავალფეროვანი ტრადიცია', 'A diverse tradition'),
    description: loc(
      'ქვემო ქართლის ფოლკლორი მრავალფეროვან ეთნოკულტურულ გარემოს ასახავს და სხვადასხვა მუსიკალურ ფერს აერთიანებს.',
      'Kvemo Kartli folklore reflects a diverse ethnocultural landscape and unites many musical colors.'
    ),
  },
};

const historyById = {
  ancient: {
    era: loc('ანტიკური ხანა', 'Ancient Era'),
    yearRange: loc('ძვ.წ. III ათასწლეული - ახ.წ. V ს.', '3rd millennium BCE - 5th century CE'),
    description: loc(
      'უძველეს ცივილიზაციებში მუსიკა რიტუალს, ძალაუფლებას და საზოგადოებრივ ცხოვრებას უკავშირდებოდა.',
      'In ancient civilizations, music was deeply tied to ritual, power, and public life.'
    ),
    countries: {
      egypt: {
        name: loc('ეგვიპტე', 'Egypt'),
        title: loc('ძველი ეგვიპტე', 'Ancient Egypt'),
        summary: loc(
          'ეგვიპტურ კულტურაში მუსიკა ტაძრებს, დღესასწაულებს და სამგლოვიარო რიტუალებს ერთნაირად ემსახურებოდა.',
          'In Egyptian culture, music served temples, celebrations, and mourning rituals alike.'
        ),
        sections: {
          celebration: loc(
            'სალხინო მუსიკა გამოიყენებოდა დღესასწაულებში, დიდებულ სასახლეებში და რელიგიურ მსვლელობებში.',
            'Celebratory music accompanied festivals, courtly gatherings, and religious processions.'
          ),
          war: loc(
            'საომარი ჟღერადობა რიტმს აძლევდა ლაშქარს და ძალაუფლების დემონსტრირებას ემსახურებოდა.',
            'Wartime music provided rhythm for armies and projected authority.'
          ),
          mourning: loc(
            'სამგლოვიარო მუსიკა გარდასვლის რიტუალის ნაწილი იყო და სევდიან, მედიტაციურ განწყობას ქმნიდა.',
            'Mourning music formed part of funeral ritual and created a solemn, meditative mood.'
          ),
        },
      },
      greece: {
        name: loc('საბერძნეთი', 'Greece'),
        title: loc('ძველი საბერძნეთი', 'Ancient Greece'),
        summary: loc(
          'ბერძნულ სამყაროში მუსიკა ფილოსოფიას, თეატრსა და განათლებას უკავშირდებოდა.',
          'In the Greek world, music was intertwined with philosophy, theater, and education.'
        ),
        sections: {
          celebration: loc(
            'სალხინო მუსიკა ისმოდა თეატრალურ წარმოდგენებში, სპორტულ ზეიმებსა და ქალაქურ დღესასწაულებზე.',
            'Celebratory music appeared in theater, civic festivals, and athletic celebrations.'
          ),
          war: loc(
            'სამხედრო მუსიკა ჯარს ერთიან ტემპში აყენებდა და საბრძოლო სულს აძლიერებდა.',
            'Military music helped keep troops in step and strengthened morale.'
          ),
          mourning: loc(
            'სამგლოვიარო მელოდიები პირად ტკივილსა და კოლექტიურ მეხსიერებას გამოხატავდა.',
            'Mourning melodies expressed private grief and collective memory.'
          ),
        },
      },
    },
  },
  medieval: {
    era: loc('შუა საუკუნეები', 'Medieval Era'),
    yearRange: loc('V - XV საუკუნე', '5th - 15th century'),
    description: loc(
      'შუა საუკუნეებში მუსიკა მჭიდროდ იყო დაკავშირებული ეკლესიასთან, სამეფო კართან და ხალხურ ტრადიციებთან.',
      'In the medieval period, music was closely connected to the church, royal courts, and folk tradition.'
    ),
    countries: {
      georgia: {
        name: loc('საქართველო', 'Georgia'),
        title: loc('შუა საუკუნეების საქართველო', 'Medieval Georgia'),
        summary: loc(
          'ქართული მრავალხმიანობა ამ ხანაში კიდევ უფრო გამყარდა და საეკლესიო თუ საერო ფორმებში თანაბრად ვითარდებოდა.',
          'Georgian polyphony deepened in this period and evolved in both sacred and secular forms.'
        ),
        sections: {
          celebration: loc(
            'სალხინო სიმღერები სუფრასთან, ქორწილში და საზოგადოებრივ ზეიმებში სრულდებოდა.',
            'Celebratory songs were performed at feasts, weddings, and public festivities.'
          ),
          war: loc(
            'საომარი სიმღერები ერთიანობას, სიმამაცესა და ისტორიულ მეხსიერებას ამაგრებდა.',
            'Wartime songs reinforced unity, courage, and historical memory.'
          ),
          mourning: loc(
            'სამგლოვიარო ტრადიცია სევდას, მოთქმას და სულიერ სიმტკიცეს გამოხატავდა.',
            'The mourning tradition expressed grief, lament, and spiritual resilience.'
          ),
        },
      },
      france: {
        name: loc('საფრანგეთი', 'France'),
        title: loc('შუა საუკუნეების საფრანგეთი', 'Medieval France'),
        summary: loc(
          'ტრუბადურების კულტურამ სიყვარულის, რაინდობისა და კარის ესთეტიკა მუსიკაში გადმოიტანა.',
          'The troubadour tradition brought the aesthetics of love, chivalry, and courtly life into music.'
        ),
        sections: {
          celebration: loc(
            'სალხინო მუსიკა კარის ცერემონიებს, ცეკვასა და საზეიმო შეკრებებს ამშვენებდა.',
            'Celebratory music accompanied court ceremonies, dancing, and festive gatherings.'
          ),
          war: loc(
            'საომარი თემები ბალადებსა და გმირულ ნარატივებში აისახებოდა.',
            'Wartime themes appeared in ballads and heroic narratives.'
          ),
          mourning: loc(
            'სამგლოვიარო მუსიკა რელიგიურ მსახურებებსა და პირად გლოვას უკავშირდებოდა.',
            'Mourning music was tied to religious services and personal grief.'
          ),
        },
      },
    },
  },
  modern: {
    era: loc('თანამედროვე ეპოქა', 'Modern Era'),
    yearRange: loc('XIX საუკუნის ბოლო - დღეს', 'Late 19th century - today'),
    description: loc(
      'თანამედროვე ეპოქამ მუსიკა გლობალურ, ტექნოლოგიურ და ჟანრობრივად მრავალფეროვან სივრცედ აქცია.',
      'The modern era turned music into a global, technological, and stylistically diverse field.'
    ),
    countries: {
      usa: {
        name: loc('აშშ', 'USA'),
        title: loc('ამერიკის შეერთებული შტატები', 'United States'),
        summary: loc(
          'აშშ-მ მნიშვნელოვანი როლი ითამაშა ჯაზის, ბლუზის, როკისა და პოპ-მუსიკის გლობალიზაციაში.',
          'The United States played a major role in the global rise of jazz, blues, rock, and pop.'
        ),
        sections: {
          celebration: loc(
            'სალხინო მუსიკა საცეკვაო კულტურას, შოუსა და მასობრივ გართობას ეყრდნობოდა.',
            'Celebratory music fed dance culture, show business, and mass entertainment.'
          ),
          war: loc(
            'ომის პერიოდებში მუსიკა პატრიოტულ, საპროტესტო და სოციალური კომენტარის ფორმას იღებდა.',
            'In wartime, music took on patriotic, protest, and socially critical roles.'
          ),
          mourning: loc(
            'სამგლოვიარო და სევდიანი ჟღერადობა განსაკუთრებით ძლიერად განვითარდა ბლუზში და სოულში.',
            'Mourning and sorrowful expression developed with special force in blues and soul.'
          ),
        },
      },
      japan: {
        name: loc('იაპონია', 'Japan'),
        title: loc('თანამედროვე იაპონია', 'Modern Japan'),
        summary: loc(
          'იაპონიამ ტრადიციული მუსიკალური ენა თანამედროვე ტექნოლოგიებსა და პოპულარულ ფორმებს შეუერთა.',
          'Japan fused traditional musical language with modern technology and popular forms.'
        ),
        sections: {
          celebration: loc(
            'სალხინო მუსიკაში თანაარსებობს ტრადიციული ცერემონია, პოპ-კულტურა და მედია-ინდუსტრია.',
            'Celebratory music spans traditional ceremony, pop culture, and media-driven performance.'
          ),
          war: loc(
            'ომთან დაკავშირებული მუსიკა ხშირად მეხსიერებას, დაკარგვასა და ეროვნული გამოცდილების გააზრებას ეხება.',
            'Music related to war often reflects on memory, loss, and national experience.'
          ),
          mourning: loc(
            'სევდიანი და მედიტაციური ხაზი იაპონურ მუსიკაში ხშირად სიმშვიდითა და სიფაქიზით გამოიხატება.',
            'A sorrowful and meditative current in Japanese music often speaks through restraint and delicacy.'
          ),
        },
      },
    },
  },
};

async function restoreInstruments() {
  const items = await Instrument.find();
  let updated = 0;

  for (const item of items) {
    const content = instrumentsByImage[item.imageUrl];
    if (!content) continue;
    Object.assign(item, content);
    await item.save();
    updated += 1;
  }

  return updated;
}

async function restoreFolklore() {
  const items = await Folklore.find();
  let updated = 0;

  for (const item of items) {
    const content = folkloreById[item.id];
    if (!content) continue;
    Object.assign(item, content);
    await item.save();
    updated += 1;
  }

  return updated;
}

async function restoreHistory() {
  const items = await History.find();
  let updated = 0;

  for (const item of items) {
    const content = historyById[item.id];
    if (!content) continue;

    item.era = content.era;
    item.yearRange = content.yearRange;
    item.description = content.description;
    item.countries = (item.countries || []).map((country) => {
      const restored = content.countries[country.id];
      if (!restored) return country;

      return {
        ...country.toObject?.(),
        name: restored.name,
        title: restored.title,
        summary: restored.summary,
        sections: Object.fromEntries(
          Object.entries(country.sections || {}).map(([sectionKey, sectionValue]) => [
            sectionKey,
            {
              ...sectionValue,
              text: restored.sections[sectionKey] || loc('', ''),
            },
          ])
        ),
      };
    });

    await item.save();
    updated += 1;
  }

  return updated;
}

async function main() {
  if (!process.env.MONGODB_URI) throw new Error('MONGODB_URI is not set');
  await mongoose.connect(process.env.MONGODB_URI);

  const [instrumentCount, folkloreCount, historyCount] = await Promise.all([
    restoreInstruments(),
    restoreFolklore(),
    restoreHistory(),
  ]);

  await mongoose.disconnect();
  console.log(`Localized content restored: instruments=${instrumentCount}, folklore=${folkloreCount}, history=${historyCount}`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
