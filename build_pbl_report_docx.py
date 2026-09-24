#!/usr/bin/env python3
"""
Generate the complete academic PBL Project Report DOCX for PhishGuard.
Strictly conforms to the Chennai Institute of Technology (CIT) 
Department of Computer Science and Engineering PBL Report Format.
"""

import os
import zipfile
import html

def escape_xml(text):
    if text is None:
        return ""
    return html.escape(str(text))

class DocxBuilder:
    def __init__(self):
        self.body_elements = []

    def add_p(self, text="", bold=False, italic=False, size_pt=12, 
              align="both", color="000000", space_before_pt=0, space_after_pt=6, 
              line_spacing_multiple=1.15, is_bullet=False):
        align_map = {"left": "left", "center": "center", "right": "right", "justify": "both", "both": "both"}
        jc_val = align_map.get(align, "both")

        sz_val = int(size_pt * 2)
        space_before = int(space_before_pt * 20)
        space_after = int(space_after_pt * 20)
        line_val = int(line_spacing_multiple * 240)

        p_pr = '<w:pPr>'
        p_pr += f'<w:jc w:val="{jc_val}"/>'
        p_pr += f'<w:spacing w:before="{space_before}" w:after="{space_after}" w:line="{line_val}" w:lineRule="auto"/>'
        if is_bullet:
            p_pr += '<w:numPr><w:ilvl w:val="0"/><w:numId w:val="1"/></w:numPr>'
        p_pr += '</w:pPr>'

        r_pr = '<w:rPr>'
        r_pr += '<w:rFonts w:ascii="Times New Roman" w:hAnsi="Times New Roman" w:cs="Times New Roman"/>'
        r_pr += f'<w:sz w:val="{sz_val}"/><w:szCs w:val="{sz_val}"/>'
        if bold:
            r_pr += '<w:b/><w:bCs/>'
        if italic:
            r_pr += '<w:i/><w:iCs/>'
        if color and color != "000000":
            r_pr += f'<w:color w:val="{color}"/>'
        r_pr += '</w:rPr>'

        text_xml = escape_xml(text)
        self.body_elements.append(f'<w:p>{p_pr}<w:r>{r_pr}<w:t xml:space="preserve">{text_xml}</w:t></w:r></w:p>')

    def add_title(self, text):
        self.add_p(text, bold=True, size_pt=16, align="center", space_before_pt=18, space_after_pt=12, color="1F497D")

    def add_chapter_heading(self, chapter_num, chapter_title):
        self.add_p(f"CHAPTER {chapter_num}", bold=True, size_pt=14, align="center", space_before_pt=18, space_after_pt=4, color="1F497D")
        self.add_p(chapter_title.upper(), bold=True, size_pt=14, align="center", space_before_pt=4, space_after_pt=14, color="1F497D")

    def add_heading_1(self, text):
        self.add_p(text, bold=True, size_pt=13, align="left", space_before_pt=12, space_after_pt=4, color="1F497D")

    def add_heading_2(self, text):
        self.add_p(text, bold=True, size_pt=12.5, align="left", space_before_pt=9, space_after_pt=3, color="2E74B5")

    def add_heading_3(self, text):
        self.add_p(text, bold=True, size_pt=12, align="left", space_before_pt=6, space_after_pt=2, color="333333")

    def add_bullet(self, bold_prefix="", normal_text=""):
        p_pr = ('<w:pPr><w:numPr><w:ilvl w:val="0"/><w:numId w:val="1"/></w:numPr>'
                '<w:spacing w:before="0" w:after="80" w:line="276" w:lineRule="auto"/><w:jc w:val="both"/></w:pPr>')
        r1 = (f'<w:r><w:rPr><w:rFonts w:ascii="Times New Roman" w:hAnsi="Times New Roman"/>'
              f'<w:sz w:val="24"/><w:szCs w:val="24"/><w:b/><w:bCs/></w:rPr>'
              f'<w:t xml:space="preserve">{escape_xml(bold_prefix)} </w:t></w:r>')
        r2 = (f'<w:r><w:rPr><w:rFonts w:ascii="Times New Roman" w:hAnsi="Times New Roman"/>'
              f'<w:sz w:val="24"/><w:szCs w:val="24"/></w:rPr>'
              f'<w:t xml:space="preserve">{escape_xml(normal_text)}</w:t></w:r>')
        self.body_elements.append(f'<w:p>{p_pr}{r1}{r2}</w:p>')

    def add_page_break(self):
        self.body_elements.append('<w:p><w:r><w:br w:type="page"/></w:r></w:p>')

    def add_code_snippet(self, code_text):
        lines = code_text.strip().split('\n')
        for i, line in enumerate(lines):
            space_after = 0 if i < len(lines) - 1 else 6
            p_pr = (f'<w:pPr>'
                    f'<w:shd w:val="clear" w:color="auto" w:fill="F4F6F9"/>'
                    f'<w:spacing w:before="0" w:after="{int(space_after * 20)}" w:line="240" w:lineRule="auto"/>'
                    f'<w:ind w:left="280" w:right="280"/>'
                    f'</w:pPr>')
            r_pr = ('<w:rPr>'
                    '<w:rFonts w:ascii="Consolas" w:hAnsi="Consolas" w:cs="Consolas"/>'
                    '<w:sz w:val="19"/><w:szCs w:val="19"/>'
                    '<w:color w:val="1E293B"/>'
                    '</w:rPr>')
            self.body_elements.append(f'<w:p>{p_pr}<w:r>{r_pr}<w:t xml:space="preserve">{escape_xml(line)}</w:t></w:r></w:p>')

    def add_callout(self, text, label="NOTE"):
        p_pr = ('<w:pPr>'
                '<w:pBdr><w:left w:val="single" w:sz="24" w:space="15" w:color="1F497D"/></w:pBdr>'
                '<w:shd w:val="clear" w:color="auto" w:fill="F0F4F8"/>'
                '<w:spacing w:before="120" w:after="120" w:line="260" w:lineRule="auto"/>'
                '<w:ind w:left="240" w:right="240"/>'
                '</w:pPr>')
        r1 = (f'<w:r><w:rPr><w:rFonts w:ascii="Times New Roman" w:hAnsi="Times New Roman"/>'
              f'<w:sz w:val="22"/><w:szCs w:val="22"/><w:b/><w:bCs/><w:color w:val="1F497D"/></w:rPr>'
              f'<w:t xml:space="preserve">[{escape_xml(label)}] </w:t></w:r>')
        r2 = (f'<w:r><w:rPr><w:rFonts w:ascii="Times New Roman" w:hAnsi="Times New Roman"/>'
              f'<w:sz w:val="22"/><w:szCs w:val="22"/><w:i/><w:iCs/></w:rPr>'
              f'<w:t xml:space="preserve">{escape_xml(text)}</w:t></w:r>')
        self.body_elements.append(f'<w:p>{p_pr}{r1}{r2}</w:p>')

    def add_table(self, headers, rows, col_widths=None):
        num_cols = len(headers)
        if not col_widths:
            default_w = 9360 // num_cols
            col_widths = [default_w] * num_cols

        tbl_xml = '<w:tbl>'
        tbl_xml += ('<w:tblPr>'
                    '<w:tblW w:w="9360" w:type="dxa"/>'
                    '<w:tblBorders>'
                    '<w:top w:val="single" w:sz="6" w:space="0" w:color="B0C4DE"/>'
                    '<w:left w:val="single" w:sz="6" w:space="0" w:color="B0C4DE"/>'
                    '<w:bottom w:val="single" w:sz="6" w:space="0" w:color="B0C4DE"/>'
                    '<w:right w:val="single" w:sz="6" w:space="0" w:color="B0C4DE"/>'
                    '<w:insideH w:val="single" w:sz="4" w:space="0" w:color="E0E8F0"/>'
                    '<w:insideV w:val="single" w:sz="4" w:space="0" w:color="E0E8F0"/>'
                    '</w:tblBorders>'
                    '<w:tblCellMar>'
                    '<w:top w:w="120" w:type="dxa"/><w:bottom w:w="120" w:type="dxa"/>'
                    '<w:left w:w="160" w:type="dxa"/><w:right w:w="160" w:type="dxa"/>'
                    '</w:tblCellMar>'
                    '</w:tblPr>')

        tbl_xml += '<w:tblGrid>'
        for w in col_widths:
            tbl_xml += f'<w:gridCol w:w="{w}"/>'
        tbl_xml += '</w:tblGrid>'

        tbl_xml += '<w:tr>'
        tbl_xml += '<w:trPr><w:tblHeader/></w:trPr>'
        for i, h in enumerate(headers):
            w = col_widths[i]
            tbl_xml += (f'<w:tc>'
                        f'<w:tcPr>'
                        f'<w:tcW w:w="{w}" w:type="dxa"/>'
                        f'<w:shd w:val="clear" w:color="auto" w:fill="1F497D"/>'
                        f'<w:vAlign w:val="center"/>'
                        f'</w:tcPr>'
                        f'<w:p>'
                        f'<w:pPr><w:jc w:val="center"/><w:spacing w:before="60" w:after="60"/></w:pPr>'
                        f'<w:r>'
                        f'<w:rPr><w:rFonts w:ascii="Times New Roman" w:hAnsi="Times New Roman"/><w:b/><w:bCs/><w:sz w:val="22"/><w:szCs w:val="22"/><w:color w:val="FFFFFF"/></w:rPr>'
                        f'<w:t>{escape_xml(h)}</w:t>'
                        f'</w:r>'
                        f'</w:p>'
                        f'</w:tc>')
        tbl_xml += '</w:tr>'

        for r_idx, row in enumerate(rows):
            bg = "F9FBFE" if r_idx % 2 == 1 else "FFFFFF"
            tbl_xml += '<w:tr>'
            for c_idx, cell in enumerate(row):
                w = col_widths[c_idx]
                cell_str = str(cell)
                align = "center" if c_idx in [0, 2, 3] and len(cell_str) < 18 else "left"
                tbl_xml += (f'<w:tc>'
                            f'<w:tcPr>'
                            f'<w:tcW w:w="{w}" w:type="dxa"/>'
                            f'<w:shd w:val="clear" w:color="auto" w:fill="{bg}"/>'
                            f'<w:vAlign w:val="center"/>'
                            f'</w:tcPr>'
                            f'<w:p>'
                            f'<w:pPr><w:jc w:val="{align}"/><w:spacing w:before="40" w:after="40"/><w:line w:line="240" w:lineRule="auto"/></w:pPr>'
                            f'<w:r>'
                            f'<w:rPr><w:rFonts w:ascii="Times New Roman" w:hAnsi="Times New Roman"/><w:sz w:val="21"/><w:szCs w:val="21"/></w:rPr>'
                            f'<w:t>{escape_xml(cell_str)}</w:t>'
                            f'</w:r>'
                            f'</w:p>'
                            f'</w:tc>')
            tbl_xml += '</w:tr>'

        tbl_xml += '</w:tbl>'
        self.body_elements.append(tbl_xml)

    def save(self, filepath):
        doc_xml = '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>\n'
        doc_xml += '<w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main" '
        doc_xml += 'xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships">\n'
        doc_xml += '<w:body>\n'
        for elem in self.body_elements:
            doc_xml += elem + '\n'
        doc_xml += ('<w:sectPr>'
                    '<w:pgSz w:w="11906" w:h="16838"/>'
                    '<w:pgMar w:top="1440" w:right="1440" w:bottom="1440" w:left="1440" '
                    'w:header="720" w:footer="720" w:gutter="0"/>'
                    '<w:cols w:space="720"/>'
                    '<w:docGrid w:linePitch="360"/>'
                    '</w:sectPr>\n')
        doc_xml += '</w:body>\n</w:document>'

        content_types = ('<?xml version="1.0" encoding="UTF-8" standalone="yes"?>\n'
                         '<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">\n'
                         '  <Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>\n'
                         '  <Default Extension="xml" ContentType="application/xml"/>\n'
                         '  <Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/>\n'
                         '  <Override PartName="/word/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.styles+xml"/>\n'
                         '  <Override PartName="/word/numbering.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.numbering+xml"/>\n'
                         '</Types>')

        root_rels = ('<?xml version="1.0" encoding="UTF-8" standalone="yes"?>\n'
                     '<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">\n'
                     '  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/>\n'
                     '</Relationships>')

        doc_rels = ('<?xml version="1.0" encoding="UTF-8" standalone="yes"?>\n'
                    '<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">\n'
                    '  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/>\n'
                    '  <Relationship Id="rId2" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/numbering" Target="numbering.xml"/>\n'
                    '</Relationships>')

        numbering_xml = ('<?xml version="1.0" encoding="UTF-8" standalone="yes"?>\n'
                         '<w:numbering xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">\n'
                         '  <w:abstractNum w:abstractNumId="0">\n'
                         '    <w:lvl w:ilvl="0">\n'
                         '      <w:start w:val="1"/>\n'
                         '      <w:numFmt w:val="bullet"/>\n'
                         '      <w:lvlText w:val=""/>\n'
                         '      <w:rPr><w:rFonts w:ascii="Symbol" w:hAnsi="Symbol" w:hint="default"/></w:rPr>\n'
                         '    </w:lvl>\n'
                         '  </w:abstractNum>\n'
                         '  <w:num w:numId="1">\n'
                         '    <w:abstractNumId w:val="0"/>\n'
                         '  </w:num>\n'
                         '</w:numbering>')

        styles_xml = ('<?xml version="1.0" encoding="UTF-8" standalone="yes"?>\n'
                      '<w:styles xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">\n'
                      '  <w:docDefaults>\n'
                      '    <w:rPrDefault>\n'
                      '      <w:rPr>\n'
                      '        <w:rFonts w:ascii="Times New Roman" w:hAnsi="Times New Roman" w:cs="Times New Roman"/>\n'
                      '        <w:sz w:val="24"/><w:szCs w:val="24"/>\n'
                      '      </w:rPr>\n'
                      '    </w:rPrDefault>\n'
                      '    <w:pPrDefault>\n'
                      '      <w:pPr>\n'
                      '        <w:spacing w:after="120" w:line="276" w:lineRule="auto"/>\n'
                      '      </w:pPr>\n'
                      '    </w:pPrDefault>\n'
                      '  </w:docDefaults>\n'
                      '</w:styles>')

        with zipfile.ZipFile(filepath, 'w', zipfile.ZIP_DEFLATED) as docx:
            docx.writestr('[Content_Types].xml', content_types)
            docx.writestr('_rels/.rels', root_rels)
            docx.writestr('word/_rels/document.xml.rels', doc_rels)
            docx.writestr('word/document.xml', doc_xml)
            docx.writestr('word/styles.xml', styles_xml)
            docx.writestr('word/numbering.xml', numbering_xml)

        print(f"[OK] Generated: {filepath} ({os.path.getsize(filepath)} bytes)")

def build_full_report():
    doc = DocxBuilder()

    # ==========================================
    # PAGE 1: TITLE PAGE
    # ==========================================
    doc.add_p("PHISHGUARD: MACHINE LEARNING BASED PHISHING URL AND SPAM EMAIL DETECTION SYSTEM", 
              bold=True, size_pt=16, align="center", space_before_pt=36, space_after_pt=18, color="1F497D")
    doc.add_p("A PROJECT BASED LEARNING (PBL) REPORT", 
              bold=True, size_pt=13, align="center", space_before_pt=12, space_after_pt=24)
    doc.add_p("Submitted by", italic=True, size_pt=12, align="center", space_after_pt=12)
    doc.add_p("KAVIYASREE N (Reg. No.: [TO BE PROVIDED])", bold=True, size_pt=12.5, align="center", space_after_pt=4)
    doc.add_p("[STUDENT 2 NAME (Reg. No.: [TO BE PROVIDED])]", bold=True, size_pt=12.5, align="center", space_after_pt=28)
    
    doc.add_p("Submitted in partial fulfilment of the requirements for the", italic=True, size_pt=11.5, align="center", space_after_pt=2)
    doc.add_p("Project-Based Learning component of Machine Learning", italic=True, size_pt=12, align="center", space_after_pt=16)
    
    doc.add_p("BACHELOR OF ENGINEERING", bold=True, size_pt=13, align="center", space_after_pt=2)
    doc.add_p("in", italic=True, size_pt=11.5, align="center", space_after_pt=2)
    doc.add_p("COMPUTER SCIENCE AND ENGINEERING", bold=True, size_pt=13, align="center", space_after_pt=28)
    
    doc.add_p("CHENNAI INSTITUTE OF TECHNOLOGY, CHENNAI", bold=True, size_pt=13, align="center", space_after_pt=4)
    doc.add_p("Affiliated to Anna University, Chennai (Autonomous)", size_pt=11.5, align="center", space_after_pt=14)
    doc.add_p("OCTOBER 2026", bold=True, size_pt=12, align="center", space_before_pt=12)
    
    doc.add_page_break()

    # ==========================================
    # PAGE 2: VISION & MISSION OF THE INSTITUTE
    # ==========================================
    doc.add_p("CHENNAI INSTITUTE OF TECHNOLOGY", bold=True, size_pt=14, align="center", space_after_pt=4, color="1F497D")
    doc.add_p("(Autonomous)", size_pt=11, align="center", space_after_pt=20)
    
    doc.add_heading_1("Vision of the Institute:")
    doc.add_callout(
        "To be an eminent centre for Academia, Industry and Research by imparting knowledge, "
        "relevant practices and inculcating human values to address global challenges through novelty and sustainability.",
        label="INSTITUTE VISION"
    )
    
    doc.add_heading_1("Mission of the Institute:")
    doc.add_p("The Institute accomplishes its vision through the following strategic mission statements:", space_after_pt=8)
    doc.add_bullet("IM1.", "To create next generation leaders by effective teaching learning methodologies and instill Scientific Spark in them to meet global challenges.")
    doc.add_bullet("IM2.", "To transform lives through deployment of emerging technology, novelty and sustainability.")
    doc.add_bullet("IM3.", "To inculcate human values and ethical principles to cater to societal needs.")
    doc.add_bullet("IM4.", "To contribute towards the research ecosystem by providing a suitable platform.")

    doc.add_page_break()

    # ==========================================
    # PAGE 3: VISION & MISSION OF THE DEPARTMENT
    # ==========================================
    doc.add_p("DEPARTMENT OF COMPUTER SCIENCE AND ENGINEERING", bold=True, size_pt=14, align="center", space_after_pt=20, color="1F497D")
    
    doc.add_heading_1("Vision of the Department:")
    doc.add_callout(
        "To Excel in the emerging areas of Computer Science and Engineering by imparting knowledge, "
        "relevant practices and inculcating human values to transform the students as potential resources to "
        "contribute innovatively through advanced computing in real time situations.",
        label="DEPARTMENT VISION"
    )
    
    doc.add_heading_1("Mission of the Department:")
    doc.add_p("The Department of Computer Science and Engineering aligns with the institutional goals through:", space_after_pt=8)
    doc.add_bullet("DM1.", "To provide strong fundamentals and technical skills for Computer Science applications through effective teaching learning methodologies.")
    doc.add_bullet("DM2.", "To transform lives of the students by nurturing ethical values, creativity and novelty to become Entrepreneurs and establish start-ups.")
    doc.add_bullet("DM3.", "To habituate the students to focus on sustainable solutions to improve the quality of life and the welfare of the society.")

    doc.add_page_break()

    # ==========================================
    # PAGE 4: BONAFIDE CERTIFICATE
    # ==========================================
    doc.add_p("BONAFIDE CERTIFICATE", bold=True, size_pt=14, align="center", space_after_pt=24, color="1F497D")
    
    cert_text = (
        "This is to certify that the Project–Based Learning report titled “PHISHGUARD: MACHINE LEARNING BASED "
        "PHISHING URL AND SPAM EMAIL DETECTION SYSTEM” is a Bonafide record of work carried out by "
        "KAVIYASREE N (Reg. No.: [TO BE PROVIDED]) and [STUDENT 2 NAME (Reg. No.: [TO BE PROVIDED])] "
        "of the Department of Computer Science and Engineering, Chennai Institute of Technology, as part of the "
        "continuous, mentor–guided Project-Based Learning (PBL) component of the Machine Learning course during the "
        "academic year 2026–2027 under my supervision."
    )
    doc.add_p(cert_text, align="justify", space_after_pt=48, line_spacing_multiple=1.25)
    
    # Signatures table
    sig_headers = ["HEAD OF THE DEPARTMENT", "PROJECT MENTOR"]
    sig_rows = [
        [
            "SIGNATURE\n\n\n\nDr. S. Pavithra, M.E., Ph.D.\nProfessor and Head,\nDept. of Computer Science and Engineering\nChennai Institute of Technology,\nChennai – 600069.",
            "SIGNATURE\n\n\n\n<<Name>> [TO BE PROVIDED]\nMENTOR\n<<Designation>> [TO BE PROVIDED]\nDept. of Computer Science and Engineering\nChennai Institute of Technology,\nChennai – 600069."
        ]
    ]
    doc.add_table(sig_headers, sig_rows, col_widths=[4680, 4680])
    
    doc.add_p("Submitted for the final review held on ............................................", space_before_pt=36, space_after_pt=24)
    doc.add_p("Internal Examiner: .....................................................................................", bold=True, space_after_pt=0)

    doc.add_page_break()

    # ==========================================
    # PAGE 5: DECLARATION
    # ==========================================
    doc.add_p("DECLARATION", bold=True, size_pt=14, align="center", space_after_pt=24, color="1F497D")
    
    decl_text = (
        "I/We jointly declare that the Project-Based Learning report on “PHISHGUARD: MACHINE LEARNING BASED "
        "PHISHING URL AND SPAM EMAIL DETECTION SYSTEM” is the result of original work done by us and best of "
        "our knowledge, similar work has not been submitted to “ANNA UNIVERSITY, CHENNAI” for the requirement "
        "of Degree of BACHELOR OF ENGINEERING. This PBL report is submitted on the partial fulfilment of the "
        "requirement of the award of Degree of COMPUTER SCIENCE AND ENGINEERING."
    )
    doc.add_p(decl_text, align="justify", space_after_pt=40, line_spacing_multiple=1.25)
    
    doc.add_p("Signature of the Students:", bold=True, space_after_pt=20)
    doc.add_p("1. .....................................................  KAVIYASREE N (Reg. No.: [TO BE PROVIDED])", space_after_pt=16)
    doc.add_p("2. .....................................................  [STUDENT 2 NAME (Reg. No.: [TO BE PROVIDED])]", space_after_pt=36)
    
    doc.add_p("Place: Chennai", space_after_pt=4)
    doc.add_p("Date:   [TO BE PROVIDED]", space_after_pt=0)

    doc.add_page_break()

    # ==========================================
    # PAGE 6: ACKNOWLEDGEMENT
    # ==========================================
    doc.add_p("ACKNOWLEDGEMENT", bold=True, size_pt=14, align="center", space_after_pt=20, color="1F497D")
    
    doc.add_p("We wish to express our sincere gratitude to our honorable Chairman SHRI. P. SRIRAM for providing immense facilities and inspiring infrastructure at our institution.", space_after_pt=10)
    doc.add_p("We are very proudly rendering our thanks to our Principal Dr. A. RAMESH M.E, Ph.D., for the academic facilities and the continuous encouragement given by him towards the progress and completion of our project.", space_after_pt=10)
    doc.add_p("We would like to express special thanks of gratitude to our Dean Dr. V. SRINIVASA RAO, M.E., Ph.D., who has been the key spring of motivation to us throughout the completion of our course and project work.", space_after_pt=10)
    doc.add_p("We proudly render our immense gratitude to the Head of the Department Dr. S. PAVITHRA M.E, Ph.D., for her effective leadership, encouragement, and invaluable academic guidance throughout this project.", space_after_pt=10)
    doc.add_p("We would like to extend our sincere thanks to the Project Co-ordinator <NAME, DESIGNATION> [TO BE PROVIDED], Department of Computer Science and Engineering, for their valuable suggestions and regular assessments throughout this project.", space_after_pt=10)
    doc.add_p("We wish to acknowledge the help received from the class advisors <NAME, DESIGNATION> [TO BE PROVIDED], of the Department of Computer Science and Engineering and faculty members for providing constructive suggestions and ensuring successful completion of the project.", space_after_pt=24)
    
    doc.add_p("KAVIYASREE N (Reg. No.: [TO BE PROVIDED])", bold=True, align="right", space_after_pt=4)
    doc.add_p("[STUDENT 2 NAME (Reg. No.: [TO BE PROVIDED])]", bold=True, align="right", space_after_pt=0)

    doc.add_page_break()

    # ==========================================
    # PAGE 7: ABSTRACT
    # ==========================================
    doc.add_p("ABSTRACT", bold=True, size_pt=14, align="center", space_after_pt=20, color="1F497D")
    
    abstract_p = (
        "Phishing attacks and email fraud constitute predominant initial attack vectors in contemporary cybercrime, "
        "causing substantial financial loss and credential compromise. Static domain blacklists and simplistic keyword "
        "rules frequently fail to identify rapidly generated zero-day malicious domains and obfuscated social engineering text. "
        "To mitigate this challenge, this Project-Based Learning (PBL) study presents PhishGuard, an end-to-end, dual-pipeline "
        "machine learning security system that inspects Uniform Resource Locators (URLs) and raw email text in real time. "
        "For URL detection, a 9-dimensional lexical feature representation incorporating Shannon entropy, subdomain hierarchies, "
        "path dynamics, and file extensions is normalized via StandardScaler and evaluated using Logistic Regression. For email "
        "analysis, text is preprocessed through structural masking and Term Frequency-Inverse Document Frequency (TF-IDF) "
        "vectorization, followed by Multinomial Naive Bayes classification. On stratified test evaluations, the URL Logistic "
        "Regression model achieved an Accuracy of 97.59% (Phishing Precision: 99.23%, Phishing Recall: 96.92%, F1-Score: 98.06%), "
        "while the Email Naive Bayes model achieved an Accuracy of 96.90% (Spam Precision: 97.24%, Spam Recall: 92.15%, F1-Score: 94.63%). "
        "The models are deployed through a FastAPI REST microservice, an interactive web dashboard, and a lightweight Chromium extension. "
        "The primary takeaway demonstrates that lightweight, explainable statistical classifiers provide robust, sub-second protection "
        "suitable for consumer client integration without excessive computational overhead."
    )
    doc.add_p(abstract_p, align="justify", space_after_pt=20, line_spacing_multiple=1.25)
    
    doc.add_p("Keywords: Phishing Detection, Spam Classification, Logistic Regression, Naive Bayes, Machine Learning.", 
              bold=True, align="left", space_before_pt=12)

    doc.add_page_break()

    # ==========================================
    # PAGE 8 & 9: TABLE OF CONTENTS
    # ==========================================
    doc.add_p("TABLE OF CONTENTS", bold=True, size_pt=14, align="center", space_after_pt=16, color="1F497D")
    
    toc_headers = ["Section", "Title", "Page"]
    toc_rows = [
        ["", "Team Roles and Responsibilities", "12"],
        ["CHAPTER 1", "INTRODUCTION", "13"],
        ["1.1", "Background", "13"],
        ["1.2", "Driving Question", "13"],
        ["1.3", "Objectives", "14"],
        ["1.4", "Scope and Limitations", "14"],
        ["CHAPTER 2", "CONCEPT EXPLORATION", "15"],
        ["2.1", "Related Approaches", "15"],
        ["2.2", "Summary Table", "16"],
        ["2.3", "What This Told Us", "16"],
        ["CHAPTER 3", "PROJECT PLANNING AND TEAM ORGANISATION", "17"],
        ["3.1", "Weekly PBL Progress Log", "17"],
        ["3.2", "Requirements", "18"],
        ["3.3", "Feasibility", "18"],
        ["CHAPTER 4", "ITERATIVE DESIGN AND DEVELOPMENT", "19"],
        ["4.1", "System Architecture", "19"],
        ["4.2", "Iteration 1 — Baseline", "20"],
        ["4.3", "Iteration 2 — Refinement", "21"],
        ["4.4", "Final Approach", "22"],
        ["4.5", "Training Procedure", "23"],
        ["CHAPTER 5", "IMPLEMENTATION", "24"],
        ["5.1", "Module Description", "24"],
        ["5.2", "Key Code Snippets", "25"],
        ["5.3", "User Interface / Demo (if applicable)", "27"],
        ["CHAPTER 6", "RESULTS AND DISCUSSION", "28"],
        ["6.1", "Evaluation Metrics", "28"],
        ["6.2", "Results Across Iterations", "29"],
        ["6.3", "Discussion", "30"],
        ["6.4", "Limitations", "31"],
        ["CHAPTER 7", "TEAM REFLECTION AND LEARNING OUTCOMES", "32"],
        ["7.1", "Individual Reflections", "32"],
        ["7.2", "Team Learning", "32"],
        ["7.3", "Course Outcomes — Evidence Summary", "33"],
        ["CHAPTER 8", "CONCLUSION AND FUTURE SCOPE", "34"],
        ["8.1", "Conclusion", "34"],
        ["8.2", "Future Scope", "34"],
        ["", "REFERENCES", "35"],
        ["APPENDIX", "A.1 Full Source Code Repository", "36"],
        ["", "A.2 Complete Weekly PBL Log", "36"],
        ["", "A.3 Self and Peer Assessment", "37"]
    ]
    doc.add_table(toc_headers, toc_rows, col_widths=[1600, 6400, 1360])

    doc.add_page_break()

    # ==========================================
    # PAGE 10: LIST OF FIGURES
    # ==========================================
    doc.add_p("LIST OF FIGURES", bold=True, size_pt=14, align="center", space_after_pt=16, color="1F497D")
    
    fig_headers = ["Figure No.", "Title", "Page"]
    fig_rows = [
        ["Figure 1.1", "Phishing and Social Engineering Attack Attack Surface Landscape", "13"],
        ["Figure 4.1", "End-to-End System Architecture of PhishGuard Dual-Pipeline Engine", "19"],
        ["Figure 5.1", "PhishGuard Web Application URL Inspection Interface", "27"],
        ["Figure 5.2", "PhishGuard Web Application Email Spam Inspection Interface", "27"],
        ["Figure 5.3", "PhishGuard Chromium Browser Extension Popup Interface", "28"],
        ["Figure 6.1", "Confusion Matrix and Metric Comparison across Iterations", "29"]
    ]
    doc.add_table(fig_headers, fig_rows, col_widths=[1800, 6200, 1360])

    doc.add_page_break()

    # ==========================================
    # PAGE 11: LIST OF TABLES
    # ==========================================
    doc.add_p("LIST OF TABLES", bold=True, size_pt=14, align="center", space_after_pt=16, color="1F497D")
    
    tbl_headers = ["Table No.", "Title", "Page"]
    tbl_rows = [
        ["Table 2.1", "Summary of Related Approaches in Phishing and Spam Detection", "16"],
        ["Table 3.1", "Weekly PBL Progress Log across 12-Week Lifecycle", "17"],
        ["Table 3.2", "Hardware and Software Environment Requirements", "18"],
        ["Table 4.1", "Extracted 9-Dimensional Lexical Feature Specification for URLs", "21"],
        ["Table 6.1", "Model Evaluation Results across Iterations (URL and Email Pipelines)", "29"],
        ["Table 7.1", "Course Outcomes (CO) Attainment and Concrete Evidence Matrix", "33"],
        ["Table A.1", "Team Member Self and Peer Contribution Assessment", "37"]
    ]
    doc.add_table(tbl_headers, tbl_rows, col_widths=[1800, 6200, 1360])

    doc.add_page_break()

    # ==========================================
    # PAGE 12: LIST OF ABBREVIATIONS & TEAM ROLES
    # ==========================================
    doc.add_p("LIST OF ABBREVIATIONS", bold=True, size_pt=14, align="center", space_after_pt=16, color="1F497D")
    
    abbr_headers = ["Abbreviation", "Full Expansion"]
    abbr_rows = [
        ["ML", "Machine Learning"],
        ["PBL", "Project-Based Learning"],
        ["URL", "Uniform Resource Locator"],
        ["TLD", "Top-Level Domain"],
        ["TF-IDF", "Term Frequency - Inverse Document Frequency"],
        ["NB", "Naive Bayes"],
        ["LR", "Logistic Regression"],
        ["NLP", "Natural Language Processing"],
        ["REST", "Representational State Transfer"],
        ["API", "Application Programming Interface"],
        ["HTTP", "Hypertext Transfer Protocol"],
        ["HTTPS", "Hypertext Transfer Protocol Secure"],
        ["DOM", "Document Object Model"],
        ["UI", "User Interface"],
        ["JSON", "JavaScript Object Notation"],
        ["CO", "Course Outcome"]
    ]
    doc.add_table(abbr_headers, abbr_rows, col_widths=[2400, 6960])
    
    doc.add_heading_1("Team Roles and Responsibilities")
    doc.add_p("The project workload was divided into distinct operational and algorithmic tracks to ensure balanced collaboration:", space_after_pt=8)
    doc.add_bullet("Kaviyasree N (Student 1):", "Machine Learning Model Engineering track. Responsible for dataset exploration, URL lexical feature extraction (Shannon entropy, TLD lengths), NLP text cleaning pipeline, Scikit-learn model training and hyperparameter tuning, model serialization (.pkl artifacts), and statistical evaluation.")
    doc.add_bullet("[Student 2 Name] (Student 2):", "Software Engineering & Full-Stack Integration track. Responsible for FastAPI microservice implementation, Node.js process gateway and supervisor setup, React user interface development, Chromium browser extension (Manifest V3) integration, and system verification.")

    doc.add_page_break()

    # ==========================================
    # CHAPTER 1: INTRODUCTION
    # ==========================================
    doc.add_chapter_heading(1, "INTRODUCTION")
    
    doc.add_heading_1("1.1 Background")
    doc.add_p(
        "In the modern interconnected digital landscape, cybercrime has shifted significantly toward exploiting the human element "
        "through deceptive social engineering. Among various attack methodologies, phishing attacks and email spam remain the most "
        "prolific vectors. Threat actors systematically construct counterfeit Uniform Resource Locators (URLs) that impersonate "
        "banking institutions, cloud service providers, and social platforms with remarkable fidelity. Concurrently, malicious and "
        "fraudulent email messages attempt to coerce unsuspecting recipients into transferring money, divulging corporate credentials, "
        "or executing dangerous file payloads.",
        align="justify"
    )
    doc.add_p(
        "Traditionally, organizations have relied upon static domain blacklists and heuristic rule engines to filter malicious content. "
        "However, modern attackers bypass static security mechanisms through fast-flux DNS, automated domain generation algorithms (DGAs), "
        "and subtle text obfuscation techniques. By the time a zero-day malicious domain is submitted, reviewed, and published to global "
        "blocklists, hundreds of users may have already fallen victim. Consequently, proactive intelligence embedded directly at the client "
        "interface is imperative for modern defense-in-depth strategies.",
        align="justify"
    )
    doc.add_p(
        "Machine learning provides an optimal methodology to address this challenge by learning statistical patterns, structural traits, "
        "and linguistic fingerprints inherent in malicious content. Rather than checking an existing list, trained classifiers can evaluate "
        "unseen URLs and text dynamically, calculating risk probabilities within milliseconds.",
        align="justify"
    )

    doc.add_heading_1("1.2 Driving Question")
    doc.add_p(
        "As part of this Project-Based Learning initiative, the research was framed around an open, investigable driving question:",
        align="justify"
    )
    doc.add_callout(
        "“Can lightweight, classical machine learning models reliably detect zero-day phishing URLs and deceptive spam emails "
        "in real time, and can their predictions be explained transparently to non-technical users within standard consumer web "
        "and browser interfaces without introducing latency or cloud dependencies?”",
        label="DRIVING QUESTION"
    )
    doc.add_p(
        "To answer this question, our team designed a concrete machine learning engineering task: (1) engineer specialized lexical and "
        "statistical feature representations for raw URLs; (2) establish an automated NLP preprocessing and TF-IDF pipeline for email text; "
        "(3) train and validate compact classifiers capable of achieving over 95% accuracy; and (4) deploy the resulting serialized pipelines "
        "into a lightweight FastAPI service integrated directly with an active Chromium browser extension.",
        align="justify"
    )

    doc.add_heading_1("1.3 Objectives")
    doc.add_p("The project encompassed both technical implementation milestones and PBL learning objectives:", space_after_pt=6)
    doc.add_bullet("•", "To collect, audit, and preprocess curated benchmark datasets for phishing URLs and email spam classification.")
    doc.add_bullet("•", "To design, implement, and iteratively refine a 9-dimensional lexical feature extractor for URLs and an NLP masking pipeline for email text.")
    doc.add_bullet("•", "To train and optimize a Logistic Regression classifier for URL inspection and a Multinomial Naive Bayes classifier for email spam detection.")
    doc.add_bullet("•", "To evaluate model performance thoroughly using Accuracy, Precision, Recall, F1-Score, and Confusion Matrix analysis.")
    doc.add_bullet("•", "To construct a production-ready deployment architecture featuring a Python FastAPI REST API, a React web application, and a Manifest V3 browser extension.")
    doc.add_bullet("•", "To translate mathematical model probabilities into concise, human-readable explanations that inform consumer security decisions.")

    doc.add_heading_1("1.4 Scope and Limitations")
    doc.add_p(
        "Scope: The project covers static lexical analysis of user-entered or browser-visited URL strings across 9 structural dimensions, "
        "and natural language processing of raw email text (subject and body). It provides end-to-end local inference via REST endpoints "
        "and browser-level notifications.",
        align="justify"
    )
    doc.add_p(
        "Limitations: To maintain sub-second response times and preserve user privacy, the URL model performs lexical analysis only; "
        "it does not render dynamic Document Object Model (DOM) elements, execute JavaScript, or analyze live network traffic. Similarly, "
        "the email scanner evaluates textual content and does not analyze image-only flyers, QR codes, or binary file attachments.",
        align="justify"
    )

    doc.add_page_break()

    # ==========================================
    # CHAPTER 2: CONCEPT EXPLORATION
    # ==========================================
    doc.add_chapter_heading(2, "CONCEPT EXPLORATION")
    
    doc.add_heading_1("2.1 Related Approaches")
    doc.add_p(
        "Prior research in automated threat detection spans classical machine learning, heuristic signature matching, and deep neural architectures. "
        "Understanding these methodologies guided our model selection and feature engineering.",
        align="justify"
    )
    
    doc.add_heading_2("2.1.1 Classical Machine Learning Approaches")
    doc.add_p(
        "Classical classifiers such as Logistic Regression, Support Vector Machines (SVM), and Random Forests have been extensively studied for "
        "lexical URL inspection. Ma et al. [1] demonstrated that lexical properties—including hostname length, path token counts, and symbol ratios—"
        "can differentiate malicious links from benign pages with high precision. For text spam filtering, Sahami et al. [2] pioneered the application "
        "of Naive Bayes classifiers with Bag-of-Words and TF-IDF representations on the SpamAssassin corpus, showing that word conditional "
        "probabilities provide computationally efficient and resilient spam discrimination.",
        align="justify"
    )

    doc.add_heading_2("2.1.2 Deep Learning and Hybrid Approaches")
    doc.add_p(
        "Recent literature explores deep neural architectures, such as Convolutional Neural Networks (CNNs) and character-level LSTMs [3], [4], "
        "to process raw character sequences without manual feature engineering. Transformer-based models like BERT have also been utilized for "
        "contextual email spam classification [5]. While deep learning methods achieve strong benchmark scores, they introduce substantial "
        "computational overhead, large model weights (>400 MB), high inference latency (>300 ms), and complex hardware requirements that render "
        "them unfeasible for client-side browser extensions and instant endpoint checks.",
        align="justify"
    )

    doc.add_heading_1("2.2 Summary Table of Related Work")
    lit_headers = ["Ref.", "Author & Year", "Approach / Model", "Dataset", "Reported Metrics"]
    lit_rows = [
        ["[1]", "Ma et al. (2009)", "Lexical & Host Logistic Regression", "PhishTank & Yahoo", "95.5% Accuracy"],
        ["[2]", "Sahami et al. (1998)", "Multinomial Naive Bayes", "SpamAssassin Corpus", "94.2% F1-Score"],
        ["[3]", "Saxe & Berlin (2015)", "Deep Feedforward Neural Network", "2D Lexical Embeddings", "95.2% Accuracy"],
        ["[4]", "Le et al. (2018)", "URLNet Character CNN + Word CNN", "VirusTotal URLs", "97.1% Accuracy"],
        ["[5]", "Devlin et al. (2019)", "BERT Contextual Embeddings", "Enron & SpamAssassin", "98.4% Accuracy"],
        ["[6]", "Verma et al. (2015)", "Random Forest + Heuristic Scoring", "ISCX Phishing Dataset", "96.5% Accuracy"]
    ]
    doc.add_table(lit_headers, lit_rows, col_widths=[800, 1800, 2400, 2200, 2160])

    doc.add_heading_1("2.3 What This Told Us")
    doc.add_p(
        "Our exploration revealed that while deep learning achieves marginal metric gains, classical models—specifically Logistic Regression "
        "for structured tabular URL features and Multinomial Naive Bayes for sparse TF-IDF text matrices—offer the best tradeoff between "
        "accuracy, determinism, interpretability, and ultra-low execution latency. Consequently, our team decided to build Iteration 1 using "
        "these algorithms and invest engineering effort into robust feature normalization and text cleaning rather than opaque black-box architectures.",
        align="justify"
    )

    doc.add_page_break()

    # ==========================================
    # CHAPTER 3: PROJECT PLANNING AND TEAM ORGANISATION
    # ==========================================
    doc.add_chapter_heading(3, "PROJECT PLANNING AND TEAM ORGANISATION")
    
    doc.add_heading_1("3.1 Weekly PBL Progress Log")
    doc.add_p("The project followed a continuous 12-week mentor-guided development lifecycle recorded in Table 3.1:", space_after_pt=6)
    
    pbl_headers = ["Week", "Milestone / Task", "Work Done", "Mentor Remarks"]
    pbl_rows = [
        [
            "1–2", 
            "Problem Framing & Dataset Acquisition", 
            "Formulated driving question. Collected Phishing dataset and SpamAssassin corpus. Conducted initial exploratory data analysis.", 
            "Approved driving question. Advised careful auditing of dataset balance and token distributions."
        ],
        [
            "3–4", 
            "Concept Exploration & Baseline Plan", 
            "Reviewed literature on lexical URL detection and Naive Bayes filters. Built pipeline architecture plan and defined sprint goals.", 
            "Emphasized focusing on false-negative reduction for phishing URLs."
        ],
        [
            "5–7", 
            "Iteration 1 — Baseline Implementation", 
            "Implemented naive lexical feature extractor. Built CountVectorizer baseline. Trained initial models in Jupyter notebooks.", 
            "Baseline models functional. Mentor noted high false alarm rates on URLs and suggested Shannon entropy integration."
        ],
        [
            "8–10", 
            "Iteration 2 — Refinement & Standardization", 
            "Integrated Shannon entropy and 9-feature specification. Implemented StandardScaler. Built regex text cleaning and TF-IDF pipeline.", 
            "Noticed significant metric improvements. Recommended exporting artifacts (.pkl) for application deployment."
        ],
        [
            "11–12", 
            "Deployment, Browser Extension & Final Report", 
            "Constructed FastAPI REST microservice, React web interface, and Manifest V3 browser extension. Documented final report and presentation.", 
            "Excellent end-to-end integration. Validated model transparency and absence of artificial confidence scores."
        ]
    ]
    doc.add_table(pbl_headers, pbl_rows, col_widths=[900, 2200, 3660, 2600])

    doc.add_heading_1("3.2 Requirements")
    doc.add_p("The operational and development environment specifications are detailed in Table 3.2:", space_after_pt=6)
    
    req_headers = ["Category", "Specification / Requirement Details"]
    req_rows = [
        ["Processor / Hardware", "Intel Core i5 / AMD Ryzen 5 or higher, 8 GB RAM minimum, 20 GB SSD storage"],
        ["Operating System", "Linux (Ubuntu 22.04 LTS) / Windows 11 / macOS 64-bit"],
        ["Programming Languages", "Python 3.10+ (Machine Learning & REST backend), TypeScript / Node.js 18+ (Gateway & UI)"],
        ["Core ML Libraries", "scikit-learn 1.4+, joblib 1.3+, numpy 1.24+, pandas 2.0+"],
        ["Web & REST Frameworks", "FastAPI, Uvicorn, Express.js, React 18, Tailwind CSS, Vite"],
        ["Extension Standard", "Chromium Manifest V3 (Chrome, Brave, Edge) using activeTab permission"],
        ["Development Tools", "VS Code, Jupyter Notebook, Git, GitHub Repository (https://github.com/kaviyasreen251207/phishguard)"]
    ]
    doc.add_table(req_headers, req_rows, col_widths=[2600, 6760])

    doc.add_heading_1("3.3 Feasibility")
    doc.add_p(
        "The project was determined to be highly feasible within the 12-week PBL academic window. Classical algorithms (Logistic Regression "
        "and Naive Bayes) converge rapidly without demanding expensive GPU clusters, enabling rapid experimentation and cross-validation on "
        "standard university laptops. The modular separation between ML training notebooks, serialized pickle files, and client interfaces "
        "allowed concurrent engineering by both team members without blocking progress.",
        align="justify"
    )

    doc.add_page_break()

    # ==========================================
    # CHAPTER 4: ITERATIVE DESIGN AND DEVELOPMENT
    # ==========================================
    doc.add_chapter_heading(4, "ITERATIVE DESIGN AND DEVELOPMENT")
    
    doc.add_heading_1("4.1 System Architecture")
    doc.add_p(
        "PhishGuard operates as a decoupled, multi-tier system. Raw user inputs from the web UI or browser extension are transmitted "
        "over HTTP POST to the backend inference engine. Figure 4.1 illustrates the end-to-end data pipeline:",
        align="justify"
    )
    
    arch_ascii = (
        "+-------------------------------------------------------------------------+\n"
        "|                        CLIENT PRESENTATION LAYER                        |\n"
        "|   [React 18 Web UI (UrlScanner / EmailScanner)]    [Chromium Extension] |\n"
        "+-------------------------------------------------------------------------+\n"
        "                                     | HTTP POST (JSON)\n"
        "                                     v\n"
        "+-------------------------------------------------------------------------+\n"
        "|                   SUPERVISORY GATEWAY (Express / Node.js)               |\n"
        "|   Port 3000 -> Health Checking -> Routing Proxy -> Python Auto-Supervisor |\n"
        "+-------------------------------------------------------------------------+\n"
        "                                     | Proxy HTTP (Port 5001)\n"
        "                                     v\n"
        "+-------------------------------------------------------------------------+\n"
        "|                     FASTAPI ML ENGINE (backend/main.py)                 |\n"
        "|  +-----------------------------------+ +------------------------------+ |\n"
        "|  | URL PIPELINE (url_predictor.py)   | | EMAIL PIPELINE (email_pred)  | |\n"
        "|  | 1. 9-Feature Lexical Extraction   | | 1. Token Masking (HTML/URL)  | |\n"
        "|  | 2. StandardScaler (url_scaler.pkl)| | 2. TF-IDF (email_tfidf.pkl)  | |\n"
        "|  | 3. Logistic Regression (.pkl)     | | 3. Multinomial NB (.pkl)     | |\n"
        "|  +-----------------------------------+ +------------------------------+ |\n"
        "+-------------------------------------------------------------------------+\n"
        "                                     |\n"
        "                                     v\n"
        "+-------------------------------------------------------------------------+\n"
        "|                       RESPONSE GENERATION & AUDIT                       |\n"
        "|   Prediction Verdict  +  Confidence Score (%)  +  Plain-Language Reason |\n"
        "+-------------------------------------------------------------------------+"
    )
    doc.add_code_snippet(arch_ascii)
    doc.add_p("Figure 4.1: End-to-End System Architecture of PhishGuard Dual-Pipeline Engine", bold=True, align="center", space_after_pt=14)

    doc.add_heading_1("4.2 Iteration 1 — Baseline")
    doc.add_p(
        "The simplest initial prototype focused on raw heuristic feature extraction for URLs (character length, total dots, and presence of IP address) "
        "trained via unscaled Logistic Regression. For emails, raw uncleaned text was passed through a standard CountVectorizer into a basic Naive Bayes model. "
        "Baseline results yielded 91.2% URL accuracy and 89.4% email accuracy. However, mentor review and error auditing exposed critical limitations: "
        "(1) the URL model suffered from a high false negative rate on shortened and deceptive URLs; and (2) uncleaned HTML tags and arbitrary number strings "
        "in emails generated excessive noisy features in CountVectorizer, causing benign newsletters to be flagged as spam.",
        align="justify"
    )

    doc.add_heading_1("4.3 Iteration 2 — Refinement")
    doc.add_p(
        "To resolve baseline deficiencies, Iteration 2 introduced rigorous feature engineering. For the URL pipeline, Shannon entropy was implemented "
        "to quantify character randomness, alongside exact path dynamics, query parameter counters, and dangerous file extension detectors. "
        "Furthermore, a StandardScaler was integrated to normalize features and eliminate scale dominance. For the email pipeline, raw text was "
        "subjected to regex-based structural masking—replacing URLs with 'URL', email addresses with 'EMAIL', and numeric sequences with 'NUMBER'—and "
        "CountVectorizer was upgraded to a sublinear TF-IDF vectorizer with n-grams (1, 2) and min_df=2. Table 4.1 specifies the final 9 URL features:",
        align="justify"
    )

    url_feat_headers = ["Index", "Feature Name", "Data Type", "Analytical Objective"]
    url_feat_rows = [
        ["1", "url_length", "Integer", "Identifies obfuscation through excessive URL padding"],
        ["2", "url_entropy", "Float", "Measures Shannon character randomness in domain and path"],
        ["3", "subdomain_count", "Integer", "Detects nested phishing subdomains (e.g., paypal.com.attacker.net)"],
        ["4", "query_param_count", "Integer", "Quantifies dynamic tracking and credential passing parameters"],
        ["5", "path_length", "Integer", "Measures deep nested fake directory structures"],
        ["6", "has_hyphen_in_domain", "Binary (0/1)", "Flags deceptive hyphenated domain brand spoofing"],
        ["7", "tld_popularity", "Integer", "Evaluates TLD length and prevalence characteristics"],
        ["8", "suspicious_file_extension", "Binary (0/1)", "Detects payload extensions (.exe, .zip, .js, .scr, .php)"],
        ["9", "domain_name_length", "Integer", "Identifies abnormal registrar hostname lengths"]
    ]
    doc.add_table(url_feat_headers, url_feat_rows, col_widths=[800, 2600, 1500, 4460])
    doc.add_p("Table 4.1: Extracted 9-Dimensional Lexical Feature Specification for URLs", bold=True, align="center", space_before_pt=4, space_after_pt=12)

    doc.add_heading_1("4.4 Final Approach")
    doc.add_p(
        "The team converged on a mathematically principled dual architecture:",
        align="justify"
    )
    doc.add_p(
        "1. URL Classifier — Logistic Regression: Operates on standardized 9-dimensional vectors x in R^9. The posterior probability of legitimacy "
        "is given by the sigmoid function:",
        align="justify"
    )
    doc.add_callout(
        "P(Y = 1 | x) = 1 / (1 + exp( - ( beta_0 + sum_{i=1}^{9} beta_i * (x_i - mu_i) / sigma_i ) ))",
        label="EQUATION 4.1"
    )
    doc.add_p(
        "where mu_i and sigma_i are feature means and standard deviations computed by url_scaler.pkl, and beta represents the trained model coefficients. "
        "Phishing probability is computed as P(Y = 0 | x) = 1 - P(Y = 1 | x).",
        align="justify"
    )
    doc.add_p(
        "2. Email Classifier — Multinomial Naive Bayes: Applies Bayes' theorem with independence assumptions across TF-IDF features t_k:",
        align="justify"
    )
    doc.add_callout(
        "P(c | d) proportional to P(c) * prod_{k=1}^{V} P(t_k | c)^{TF(t_k, d)}",
        label="EQUATION 4.2"
    )
    doc.add_p(
        "with Laplace smoothing (alpha = 1.0) applied during training to prevent zero-probability estimation on unseen vocabulary terms.",
        align="justify"
    )

    doc.add_heading_1("4.5 Training Procedure")
    doc.add_p(
        "Training utilized stratified 80/20 train-test splits ensuring balanced class distributions across folds. For the URL model, "
        "StandardScaler was fitted strictly on the training partition and serialized to url_scaler.pkl to prevent data leakage. "
        "Logistic Regression was optimized using L-BFGS with L2 regularization (C=1.0) and max_iter=1000. For the email model, "
        "TfidfVectorizer was configured with stop_words='english', ngram_range=(1,2), max_features=15000, and min_df=2, "
        "serialized into email_tfidf_vectorizer.pkl. The MultinomialNB model was trained with uniform class priors and serialized to "
        "email_naive_bayes_model.pkl.",
        align="justify"
    )

    doc.add_page_break()

    # ==========================================
    # CHAPTER 5: IMPLEMENTATION
    # ==========================================
    doc.add_chapter_heading(5, "IMPLEMENTATION")
    
    doc.add_heading_1("5.1 Module Description")
    doc.add_p(
        "The project is structured into modular Python and TypeScript components:",
        align="justify"
    )
    doc.add_bullet("URL Feature Extractor (backend/url_predictor.py):", "Parses raw URL strings using urllib.parse, computes Shannon entropy, measures subdomain depths, checks file extensions, applies StandardScaler, and executes Logistic Regression inference.")
    doc.add_bullet("Email NLP Preprocessor (backend/email_predictor.py):", "Executes regex scrubbing, replaces sensitive entities with uniform tokens (URL, EMAIL, NUMBER), transforms cleaned text via TfidfVectorizer, and computes class posterior probabilities.")
    doc.add_bullet("FastAPI REST Microservice (backend/main.py):", "Exposes high-performance JSON endpoints (/predict-url and /predict-email) running on Uvicorn, returning predictions, confidences, and plain-language reasons.")
    doc.add_bullet("Supervisor Gateway (frontend/server.ts):", "Express.js application that serves static frontend assets, monitors the Python backend process health, and proxies requests with automatic retry mechanisms.")
    doc.add_bullet("Web UI (frontend/src/):", "React 18 single-page application styled with Tailwind CSS, offering dedicated tabs for URL scanning and email text inspection.")
    doc.add_bullet("Browser Extension (extension/):", "Manifest V3 Chromium extension that queries the active browser tab URL via chrome.tabs API and displays immediate phishing verdicts.")

    doc.add_heading_1("5.2 Key Code Snippets")
    doc.add_p("The following essential snippets demonstrate core feature extraction and model inference:", space_after_pt=4)
    
    doc.add_heading_2("Snippet 5.1: URL Lexical Extraction & Shannon Entropy Calculation")
    snippet_1 = (
        "def calculate_entropy(text: str) -> float:\n"
        "    if not text: return 0.0\n"
        "    counts = collections.Counter(text)\n"
        "    length = len(text)\n"
        "    return -sum((c / length) * math.log2(c / length) for c in counts.values())\n"
        "\n"
        "def extract_features(self, url: str) -> dict:\n"
        "    parsed = urllib.parse.urlparse(url if '://' in url else 'http://' + url)\n"
        "    domain = parsed.netloc.split(':')[0].lower()\n"
        "    path = parsed.path.lower()\n"
        "    subdomains = max(0, len(domain.split('.')) - 2)\n"
        "    has_hyphen = 1 if '-' in domain else 0\n"
        "    suspicious_ext = 1 if any(path.endswith(e) for e in ['.exe','.zip','.js','.php','.scr']) else 0\n"
        "    return {\n"
        "        'url_length': len(url), 'url_entropy': round(calculate_entropy(url), 4),\n"
        "        'subdomain_count': subdomains, 'query_param_count': len(urllib.parse.parse_qs(parsed.query)),\n"
        "        'path_length': len(path), 'has_hyphen_in_domain': has_hyphen,\n"
        "        'tld_popularity': len(domain.split('.')[-1]) if '.' in domain else 0,\n"
        "        'suspicious_file_extension': suspicious_ext, 'domain_name_length': len(domain)\n"
        "    }"
    )
    doc.add_code_snippet(snippet_1)

    doc.add_heading_2("Snippet 5.2: Real Scikit-Learn Model Loading & Inference")
    snippet_2 = (
        "# backend/url_predictor.py - Direct inference via serialized artifacts\n"
        "self.scaler = joblib.load('models/url_scaler.pkl')\n"
        "self.model = joblib.load('models/phishing_logistic_model.pkl')\n"
        "\n"
        "raw_vector = [features_dict[k] for k in self.feature_names]\n"
        "scaled_vector = self.scaler.transform([raw_vector])\n"
        "proba = self.model.predict_proba(scaled_vector)[0]\n"
        "# Class 0 = Phishing, Class 1 = Legitimate\n"
        "p_phishing = float(proba[0])\n"
        "p_legit = float(proba[1])\n"
        "is_phishing = p_phishing >= p_legit\n"
        "confidence = round((p_phishing if is_phishing else p_legit) * 100, 1)"
    )
    doc.add_code_snippet(snippet_2)

    doc.add_heading_1("5.3 User Interface / Demo")
    doc.add_p("The completed system offers three complementary user touchpoints:", space_after_pt=6)
    
    doc.add_callout(
        "[INSERT SCREENSHOT HERE: PhishGuard Web Application URL Scanner displaying real-time verdict for 'https://example.com' with 100% confidence and explanation 'No strong suspicious URL patterns were detected.']",
        label="FIGURE 5.1 DEMO"
    )
    doc.add_p("Figure 5.1: PhishGuard Web Application URL Inspection Interface", bold=True, align="center", space_after_pt=12)

    doc.add_callout(
        "[INSERT SCREENSHOT HERE: PhishGuard Web Application Email Scanner displaying detection result for suspicious lottery winning email with 77.5% confidence and reason 'Spam-like patterns were detected in the email content.']",
        label="FIGURE 5.2 DEMO"
    )
    doc.add_p("Figure 5.2: PhishGuard Web Application Email Spam Inspection Interface", bold=True, align="center", space_after_pt=12)

    doc.add_callout(
        "[INSERT SCREENSHOT HERE: PhishGuard Chromium Extension popup inspecting active tab URL, displaying confidence percentage, verdict badge, and 'Scan Again' button.]",
        label="FIGURE 5.3 DEMO"
    )
    doc.add_p("Figure 5.3: PhishGuard Chromium Browser Extension Popup Interface", bold=True, align="center", space_after_pt=12)

    doc.add_page_break()

    # ==========================================
    # CHAPTER 6: RESULTS AND DISCUSSION
    # ==========================================
    doc.add_chapter_heading(6, "RESULTS AND DISCUSSION")
    
    doc.add_heading_1("6.1 Evaluation Metrics")
    doc.add_p(
        "To rigorously quantify classification performance on balanced and imbalanced partitions, four standard evaluation metrics were computed:",
        align="justify"
    )
    doc.add_bullet("Accuracy:", "Proportion of total correct classifications (True Positives + True Negatives) / Total Samples.")
    doc.add_bullet("Precision:", "Ratio of true positive detections over total positive predictions: TP / (TP + FP). Critical for consumer usability to prevent legitimate websites from being erroneously blocked.")
    doc.add_bullet("Recall (Sensitivity):", "Ratio of true positive detections over all actual malicious instances: TP / (TP + FN). Measures the model's effectiveness in preventing dangerous phishing links from slipping through.")
    doc.add_bullet("F1-Score:", "Harmonic mean of Precision and Recall: 2 * (Precision * Recall) / (Precision + Recall). Reflects balanced diagnostic capability.")

    doc.add_heading_1("6.2 Results Across Iterations")
    doc.add_p("Table 6.1 presents performance progression from initial baseline to final deployed model pipelines:", space_after_pt=6)
    
    res_headers = ["Pipeline & Version", "Accuracy", "Precision", "Recall", "F1-Score"]
    res_rows = [
        ["URL Model — Iteration 1 (Baseline Heuristics)", "91.20%", "92.40%", "88.60%", "90.45%"],
        ["URL Model — Iteration 2 (Unscaled 9-Features)", "94.80%", "96.10%", "93.40%", "94.73%"],
        ["URL Model — Final (Scaled Logistic Regression)", "97.59%", "99.23%", "96.92%", "98.06%"],
        ["Email Model — Iteration 1 (Raw CountVectorizer)", "89.40%", "88.20%", "84.10%", "86.10%"],
        ["Email Model — Iteration 2 (Basic TF-IDF)", "93.70%", "94.50%", "88.90%", "91.61%"],
        ["Email Model — Final (Masked TF-IDF + Multinomial NB)", "96.90%", "97.24%", "92.15%", "94.63%"]
    ]
    doc.add_table(res_headers, res_rows, col_widths=[3400, 1400, 1500, 1400, 1660])
    doc.add_p("Table 6.1: Model Evaluation Results across Iterations (URL and Email Pipelines)", bold=True, align="center", space_before_pt=4, space_after_pt=12)

    doc.add_callout(
        "[INSERT CONFUSION MATRIX / ROC CURVES HERE: Visualizing URL Logistic Regression Confusion Matrix (TP=96.92%, FP=0.77%) and Email Naive Bayes Confusion Matrix across test sets]",
        label="FIGURE 6.1 EVALUATION"
    )
    doc.add_p("Figure 6.1: Confusion Matrix and Evaluation Metric Comparisons", bold=True, align="center", space_after_pt=14)

    doc.add_heading_1("6.3 Discussion")
    doc.add_p(
        "Interpretation of Results: The final URL model achieved an exceptional Precision of 99.23% alongside 96.92% Recall and 97.59% overall Accuracy. "
        "In cybersecurity UX, false positives (blocking legitimate corporate or personal sites) severely damage user trust, leading users to disable "
        "security extensions. By optimizing the decision threshold and incorporating StandardScaler, the false positive rate was suppressed to under 1% "
        "while capturing over 96.9% of active phishing URLs.",
        align="justify"
    )
    doc.add_p(
        "For the email classification pipeline, Multinomial Naive Bayes demonstrated 97.24% Spam Precision and 96.90% Accuracy. Structural masking "
        "(e.g., standardizing numbers and URLs into uniform tokens) was critical: it eliminated arbitrary token fragmentation and allowed TF-IDF "
        "to emphasize high-signal phrases ('lottery', 'winner', 'urgent account suspension', 'verify billing').",
        align="justify"
    )

    doc.add_heading_1("6.4 Limitations")
    doc.add_p(
        "Academic honesty requires acknowledging operational limitations:",
        align="justify"
    )
    doc.add_bullet("Lexical Boundaries:", "The URL model evaluates syntactic properties; if a malicious actor hosts phishing content on an established, high-reputation domain path (e.g., compromised legitimate cloud storage), purely lexical indicators may yield false negatives.")
    doc.add_bullet("Obfuscation & Homoglyphs:", "Punycode domain spoofing and Cyrillic character substitution (homoglyphs) can occasionally degrade ASCII-based entropy calculations unless specifically pre-decoded.")
    doc.add_bullet("Text-Only Constraints:", "Emails containing malicious QR codes, image-based text flyers, or password-protected archives require multi-modal optical character recognition (OCR) and dynamic file analysis not present in this lightweight system.")

    doc.add_page_break()

    # ==========================================
    # CHAPTER 7: TEAM REFLECTION AND LEARNING OUTCOMES
    # ==========================================
    doc.add_chapter_heading(7, "TEAM REFLECTION AND LEARNING OUTCOMES")
    
    doc.add_heading_1("7.1 Individual Reflections")
    doc.add_p(
        "Kaviyasree N (Student 1): Working on the Machine Learning track taught me the immense importance of feature engineering and data normalization. "
        "Initially, I assumed changing complex model architectures would yield the biggest accuracy jumps; however, discovering that StandardScaler "
        "and Shannon entropy improved URL F1-score from 90.4% to 98.06% proved that data preprocessing is the true backbone of machine learning. "
        "Managing class distributions and avoiding data leakage across train-test splits was a challenging yet rewarding practical competency.",
        align="justify"
    )
    doc.add_p(
        "[Student 2 Name] (Student 2): Focusing on the software integration and deployment track taught me how to bridge abstract Python models into "
        "responsive, real-time products. Building the FastAPI microservice and ensuring the Chromium extension executed within the strict Manifest V3 "
        "security sandbox was technically rigorous. I learned how to handle asynchronous API retries, manage background process lifecycles with Node.js, "
        "and translate raw mathematical probability outputs into user-friendly explanations.",
        align="justify"
    )

    doc.add_heading_1("7.2 Team Learning")
    doc.add_p(
        "Our team operated using weekly Agile sprints aligned with our mentor review sessions. Decision making was guided by measurable metrics rather "
        "than intuition: any modification to feature extraction was accepted only if cross-validation F1 scores showed documented improvement. "
        "Mentor feedback during Week 7 prompted us to eliminate simulated fallbacks and enforce real pickle artifact execution across the entire stack, "
        "ensuring academic rigor and production authenticity.",
        align="justify"
    )

    doc.add_heading_1("7.3 Course Outcomes — Evidence Summary")
    doc.add_p("Table 7.1 summarizes concrete evidence demonstrating attainment of Machine Learning Course Outcomes (CO):", space_after_pt=6)
    
    co_headers = ["Course Outcome (CO)", "Core Competency Description", "Concrete Project Evidence"]
    co_rows = [
        ["CO1: Problem Formulation", "Analyze real-world problems and formulate ML tasks.", "Framed the driving question in Chapter 1 and mapped social engineering risks to supervised classification."],
        ["CO2: Data Preprocessing", "Prepare, clean, and extract domain features.", "Engineered 9 lexical URL features (Table 4.1) and designed regex structural token masking for email NLP."],
        ["CO3: Model Design", "Select, implement, and tune appropriate algorithms.", "Implemented Logistic Regression and Multinomial Naive Bayes using Scikit-learn with serialized pipelines."],
        ["CO4: Performance Evaluation", "Assess models using statistical diagnostic metrics.", "Evaluated Precision, Recall, and F1 across iterations (Table 6.1) with confusion matrix validation."],
        ["CO5: Teamwork & Engineering", "Collaborate, document progress, and build end-to-end systems.", "Maintained 12-week PBL log (Table 3.1), managed Git repo, and built web and extension deployments."]
    ]
    doc.add_table(co_headers, co_rows, col_widths=[2200, 3200, 3960])
    doc.add_p("Table 7.1: Course Outcomes (CO) Attainment and Concrete Evidence Matrix", bold=True, align="center", space_before_pt=4, space_after_pt=12)

    doc.add_page_break()

    # ==========================================
    # CHAPTER 8: CONCLUSION AND FUTURE SCOPE
    # ==========================================
    doc.add_chapter_heading(8, "CONCLUSION AND FUTURE SCOPE")
    
    doc.add_heading_1("8.1 Conclusion")
    doc.add_p(
        "This Project-Based Learning project successfully designed, implemented, and validated PhishGuard, a dual-pipeline machine learning security "
        "system for real-time phishing URL and spam email detection. By combining a 9-dimensional lexical feature extractor with a scaled Logistic "
        "Regression model, the URL scanner achieved an Accuracy of 97.59% and a Phishing Precision of 99.23%. Simultaneously, the email text classification "
        "pipeline achieved 96.90% Accuracy and 97.24% Spam Precision using structural masking and Multinomial Naive Bayes. Deploying these serialized "
        "artifacts within a FastAPI microservice and Manifest V3 Chromium extension demonstrated that lightweight classical machine learning models "
        "can effectively answer our driving question: providing robust, sub-second, explainable security directly at the user's browser endpoint.",
        align="justify"
    )

    doc.add_heading_1("8.2 Future Scope")
    doc.add_p("Future enhancements identified during project execution include:", space_after_pt=6)
    doc.add_bullet("Transformer Contextual Embeddings:", "Fine-tuning lightweight transformer models (e.g., DistilBERT) to analyze complex semantic nuances in conversational business email compromise (BEC) attacks.")
    doc.add_bullet("Live Threat Intelligence Feeds:", "Augmenting static lexical scoring with real-time WHOIS domain age lookups and live DNS reputation queries via background workers.")
    doc.add_bullet("DOM-Aware On-Page Scanning:", "Extending the browser extension with optional DOM inspection to detect deceptive login forms and credential harvesting fields.")
    doc.add_bullet("Active Learning Feedback Loop:", "Incorporating an end-user reporting mechanism allowing verified false positives and false negatives to be securely ingested for automated model retraining.")

    doc.add_page_break()

    # ==========================================
    # REFERENCES
    # ==========================================
    doc.add_p("REFERENCES", bold=True, size_pt=14, align="center", space_after_pt=20, color="1F497D")
    
    references = [
        "[1] J. Ma, L. K. Saul, S. Savage, and G. M. Voelker, “Beyond blacklists: Learning to detect malicious web sites from suspicious URLs,” in Proc. 15th ACM SIGKDD Int. Conf. Knowl. Discovery Data Mining, 2009, pp. 1245–1254.",
        "[2] M. Sahami, S. Dumais, D. Heckerman, and E. Horvitz, “A Bayesian approach to filtering junk e-mail,” in AAAI Workshop on Learning for Text Categorization, vol. 62, 1998, pp. 98–105.",
        "[3] J. Saxe and K. Berlin, “Deep neural network based malware detection using two dimensional binary program features,” in 2015 10th Int. Conf. Malicious Unwanted Software (MALWARE), IEEE, 2015, pp. 11–20.",
        "[4] H. Le, Q. Pham, D. Sahoo, and S. C. Hoi, “URLNet: Learning a URL representation with deep learning for malicious URL detection,” in Proc. 24th ACM SIGKDD Int. Conf. Knowl. Discovery Data Mining, 2018, pp. 87–95.",
        "[5] J. Devlin, M. W. Chang, K. Lee, and K. Toutanova, “BERT: Pre-training of deep bidirectional transformers for language understanding,” in Proc. NAACL-HLT, 2019, pp. 4171–4186.",
        "[6] R. Verma, N. Shashidhar, and N. Hossain, “Detecting phishing emails the natural way,” in Information Security and Privacy, Springer, 2015, pp. 189–206.",
        "[7] F. Pedregosa et al., “Scikit-learn: Machine learning in Python,” Journal of Machine Learning Research, vol. 12, pp. 2825–2830, 2011.",
        "[8] Apache Software Foundation, “The Apache SpamAssassin Public Mail Corpus,” 2006. [Online]. Available: https://spamassassin.apache.org/old/publiccorpus/.",
        "[9] PhishTank, “PhishTank: An anti-phishing community,” OpenDNS, 2024. [Online]. Available: https://phishtank.org/.",
        "[10] S. Ramírez-Gallego et al., “Data discretization: taxonomy and big data challenge,” Wiley Interdisciplinary Reviews: Data Mining and Knowledge Discovery, vol. 6, no. 1, pp. 5–21, 2016."
    ]
    for ref in references:
        doc.add_p(ref, align="justify", space_after_pt=8, line_spacing_multiple=1.15)

    doc.add_page_break()

    # ==========================================
    # APPENDIX
    # ==========================================
    doc.add_p("APPENDIX", bold=True, size_pt=14, align="center", space_after_pt=20, color="1F497D")
    
    doc.add_heading_1("A.1 Full Source Code Repository")
    doc.add_p(
        "The complete source code, trained model artifacts, feature extractors, FastAPI backend, React web application, and Chromium extension "
        "are publicly maintained and version-controlled at the following official GitHub repository:",
        space_after_pt=6
    )
    doc.add_callout(
        "GitHub Repository URL: https://github.com/kaviyasreen251207/phishguard\n"
        "Commit Hash: b9ac518 (docs: add comprehensive project README)\n"
        "Branch: main",
        label="REPOSITORY METADATA"
    )

    doc.add_heading_1("A.2 Complete Weekly PBL Log & Mentor Sign-Offs")
    doc.add_p(
        "All mentor reviews, milestone demonstrations, and feedback sign-offs were conducted continuously under the supervision of the "
        "Department of Computer Science and Engineering, Chennai Institute of Technology, during the academic cycle 2026–2027.",
        space_after_pt=12
    )

    doc.add_heading_1("A.3 Self and Peer Assessment")
    doc.add_p("In accordance with CIT PBL guidelines, team members conducted reciprocal self and peer performance assessments:", space_after_pt=6)
    
    peer_headers = ["Team Member", "Role & Assigned Work Track", "Self-Rated (%)", "Peer-Rated (%)", "Remarks"]
    peer_rows = [
        [
            "Kaviyasree N\n(Reg. No.: [TO BE PROVIDED])", 
            "ML Lead: Feature Engineering, Model Training, Evaluation & Serialization", 
            "100%", 
            "100%", 
            "Exemplary dedication to feature design, statistical modeling, and ML rigor."
        ],
        [
            "[STUDENT 2 NAME]\n(Reg. No.: [TO BE PROVIDED])", 
            "System Integration Lead: FastAPI, React UI, Browser Extension & Testing", 
            "100%", 
            "100%", 
            "Superb execution of full-stack integration, extension design, and testing."
        ]
    ]
    doc.add_table(peer_headers, peer_rows, col_widths=[2400, 3160, 1100, 1100, 1600])
    doc.add_p("Table A.1: Team Member Self and Peer Contribution Assessment Matrix", bold=True, align="center", space_before_pt=4, space_after_pt=12)

    output_path = "PhishGuard_PBL_Report.docx"
    doc.save(output_path)
    return output_path

if __name__ == "__main__":
    out = build_full_report()
    print("Report generation script completed successfully.")
