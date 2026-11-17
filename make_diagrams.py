from PIL import Image,ImageDraw,ImageFont
from pathlib import Path
out=Path(r'C:\Users\tanvi\OneDrive\Documents\Data_Analysis\SmartData_Insight_Project_Report\diagrams')
font=ImageFont.load_default()
def diagram(name, boxes, arrows):
 im=Image.new('RGB',(1400,700),'white'); d=ImageDraw.Draw(im)
 for x,y,w,h,text in boxes:
  d.rounded_rectangle((x,y,x+w,y+h),radius=16,fill='#EAF4E2',outline='#3F5F35',width=3)
  d.multiline_text((x+15,y+25),text,fill='black',font=font,spacing=5)
 for a,b in arrows:
  x1,y1=boxes[a][0]+boxes[a][2],boxes[a][1]+boxes[a][3]//2; x2,y2=boxes[b][0],boxes[b][1]+boxes[b][3]//2
  d.line((x1,y1,x2,y2),fill='#555555',width=3)
  d.polygon([(x2,y2),(x2-12,y2-7),(x2-12,y2+7)],fill='#555555')
 im.save(out/name)
diagram('architecture.png',[(60,250,220,100,'React + Vite\nFrontend'),(400,250,220,100,'Express REST API\nAuth + Controllers'),(740,100,260,100,'MongoDB Atlas\nMongoose models'),(740,250,260,100,'Analysis + File\nProcessing Services'),(740,400,260,100,'Gemini + Cloudinary\nOptional services'),(1100,250,220,100,'PDFKit Reports\nLocal fallback')],[(0,1),(1,2),(1,3),(1,4),(3,5)])
diagram('flow.png',[(60,270,180,90,'Upload dataset'),(330,270,180,90,'Process + validate'),(600,270,180,90,'Analyze + clean'),(870,150,180,90,'Visualize'),(870,390,180,90,'Generate PDF'),(1140,270,180,90,'History + download')],[(0,1),(1,2),(2,3),(2,4),(3,5),(4,5)])
diagram('er.png',[(80,250,170,90,'User'),(350,100,190,90,'Dataset'),(350,400,190,90,'Conversation'),(700,100,190,90,'Analysis'),(700,400,190,90,'Report')],[(0,1),(0,2),(1,3),(1,4),(0,4)])
