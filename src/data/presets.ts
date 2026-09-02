export const KKU_DEPARTMENTS = [
  'กลุ่มวิชาพยาธิชีววิทยา (Pathobiology)',
  'กลุ่มวิชาพรีคลินิก (Pre-clinic)',
  'กลุ่มวิชาคลินิกสัตว์เลี้ยง (Small Animal Clinical Sciences)',
  'กลุ่มวิชาคลินิกสัตว์ใหญ่ (Large Animal Clinical Sciences)',
  'ศูนย์เครื่องมือวิจัยและบริการทางวิทยาศาสตร์ คณะสัตวแพทยศาสตร์',
  'โรงพยาบาลสัตว์ คณะสัตวแพทยศาสตร์',
  'อื่นๆ (ระบุ)',
];

export const PRESET_LABS_02 = [
  'ห้องปฏิบัติการพยาธิวิทยาคลินิก (Clinical Pathology Lab)',
  'ห้องปฏิบัติการจุลชีววิทยาและภูมิคุ้มกันวิทยา (Microbiology & Immunology Lab)',
  'ห้องปฏิบัติการปรสิตวิทยา (Parasitology Lab)',
  'ห้องปฏิบัติการสรีรวิทยาและชีวเคมี (Physiology & Biochemistry Lab)',
  'ห้องปฏิบัติการชีววิทยาระดับโมเลกุล (Molecular Biology Lab)',
  'ห้องปฏิบัติการกายวิภาคศาสตร์และจุลกายวิภาคศาสตร์ (Anatomy & Histology Lab)',
  'ห้องปฏิบัติการพิษวิทยาและเภสัชวิทยา (Toxicology & Pharmacology Lab)',
  'ห้องเพาะเลี้ยงเนื้อเยื่อและเซลล์ (Cell Culture Lab)',
  'ห้องปฏิบัติการวิจัยสัตว์น้ำ (Aquatic Animal Lab)',
  'ห้องปฏิบัติการสัตว์ทดลอง (Laboratory Animal Facility)',
];

export const PRESET_EQUIPMENT_03 = [
  { name: 'ตู้ดูดควันชีวนิรภัย Biosafety Cabinet Class II Type A2', defaultLab: 'ห้องปฏิบัติการจุลชีววิทยา', isField: false },
  { name: 'เครื่องเพิ่มปริมาณสารพันธุกรรม Real-Time PCR (StepOnePlus / QuantStudio)', defaultLab: 'ห้องชีววิทยาโมเลกุล', isField: false },
  { name: 'กล้องจุลทรรศน์ฟลูออเรสเซนต์ (Fluorescence Microscope)', defaultLab: 'ห้องปฏิบัติการพยาธิวิทยา', isField: false },
  { name: 'เครื่องปั่นเหวี่ยงความเร็วสูงควบคุมอุณหภูมิ (Refrigerated Centrifuge)', defaultLab: 'ห้องปฏิบัติการชีวเคมี', isField: false },
  { name: 'เครื่องวัดค่าการดูดกลืนแสง Spectrophotometer (UV-Vis / NanoDrop)', defaultLab: 'ห้องปฏิบัติการชีวเคมี', isField: false },
  { name: 'ตู้บ่มเพาะเลี้ยงเซลล์ CO2 Incubator', defaultLab: 'ห้องเพาะเลี้ยงเซลล์', isField: false },
  { name: 'เครื่องนึ่งฆ่าเชื้อด้วยไอน้ำแรงดันสูง (Autoclave 50-100L)', defaultLab: 'ห้องเตรียมอาหารเลี้ยงเชื้อ', isField: false },
  { name: 'เครื่องตรวจวัดคุณภาพน้ำภาคสนาม (Portable pH/DO Meter)', defaultLab: 'ห้องปฏิบัติการสัตว์น้ำ', isField: true },
  { name: 'กล่องเก็บรักษาตัวอย่างเก็บความเย็นภาคสนาม (Field Sampling Cooler Box)', defaultLab: 'งานบริการวิจัยภาคสนาม', isField: true },
  { name: 'เครื่องอัลตราซาวด์สัตวแพทย์แบบพกพา (Portable Veterinary Ultrasound)', defaultLab: 'งานคลินิกภาคสนาม', isField: true },
  { name: 'เครื่องวัดสัญญาณชีพสัตว์แบบพกพา (Portable Patient Monitor)', defaultLab: 'งานคลินิกภาคสนาม', isField: true },
  { name: 'เครื่องอ่านไมโครชิพสัตว์ (Microchip Reader)', defaultLab: 'ศูนย์วิจัยสัตว์ทดลอง', isField: true },
];

export const PRESET_CHEMICALS_04 = [
  { name: 'Ethanol 95% AR Grade', defaultQty: '1 ขวด (Bottle)', defaultRemarks: 'ใช้งานทำความสะอาดและสกัดสาร' },
  { name: 'Formalin 10% Neutral Buffered', defaultQty: '5 ลิตร (Gallon)', defaultRemarks: 'ใช้ตรึงสภาพชิ้นเนื้อตัวอย่าง' },
  { name: 'Phosphate Buffered Saline (PBS 10X)', defaultQty: '500 mL', defaultRemarks: 'ใช้เจือจางและล้างเซลล์' },
  { name: 'Giemsa Stain Solution', defaultQty: '100 mL', defaultRemarks: 'ใช้ย้อมสเมียร์เลือดและเซลล์วิทยา' },
  { name: 'Gram Stain Kit (ชุดสีย้อมแกรม)', defaultQty: '1 ชุด', defaultRemarks: 'ใช้จำแนกแบคทีเรีย' },
  { name: 'Agarose Gel Electrophoresis Grade', defaultQty: '100 g', defaultRemarks: 'ใช้ทำเจลตรวจแยก DNA' },
  { name: 'TBE Buffer 10X Solution', defaultQty: '1,000 mL', defaultRemarks: 'สารละลายนำไฟฟ้า Gel Electrophoresis' },
  { name: 'Pipette Tips 10-200 µL (Yellow) พร้อมกล่อง Autoclave', defaultQty: '2 กล่อง (192 ทิป)', defaultRemarks: 'งานดูดจ่ายสารละลาย' },
  { name: 'Pipette Tips 100-1000 µL (Blue) แบบฆ่าเชื้อ', defaultQty: '2 กล่อง (192 ทิป)', defaultRemarks: 'งานดูดจ่ายสารละลาย' },
  { name: 'Microcentrifuge Tubes 1.5 mL (DNase/RNase Free)', defaultQty: '1 ถุง (500 หลอด)', defaultRemarks: 'เก็บตัวอย่างสารพันธุกรรม' },
  { name: 'ถุงมือไนไตรล์ Size M (Nitrile Gloves)', defaultQty: '1 กล่อง (100 ชิ้น)', defaultRemarks: 'อุปกรณ์ป้องกันส่วนบุคคล' },
  { name: 'สไลด์แก้วและกระจกปิดสไลด์ (Glass Slides & Cover Slips)', defaultQty: '2 กล่อง', defaultRemarks: 'เตรียมสไลด์ตัวอย่างตรวจ' },
];
