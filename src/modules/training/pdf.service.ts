/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-return */
import { BadRequestException, Injectable } from '@nestjs/common';
import * as path from 'path';
import pdfjsLib from 'pdfjs-dist/legacy/build/pdf.mjs';

@Injectable()
export class PdfService {
  async extractTextPageByPage(buffer: Buffer): Promise<string[]> {
    try {
      const uint8Array = new Uint8Array(buffer);

      const pdf = await pdfjsLib.getDocument({
        data: uint8Array,
        standardFontDataUrl: path.join(
          process.cwd(),
          'node_modules/pdfjs-dist/standard_fonts/',
        ),
        useWorkerFetch: false,
        isEvalSupported: false,
      }).promise;

      const pageTexts: string[] = [];

      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const content = await page.getTextContent();

        const text = content.items
          .map((item: any) => ('str' in item ? item.str : ''))
          .join(' ')
          // eslint-disable-next-line no-control-regex
          .replace(/[\u0000-\u001F\u007F-\u009F]/g, '')
          .replace(/\s+/g, ' ')
          .normalize('NFC')
          .trim();

        pageTexts.push(text);
      }

      return pageTexts;
    } catch (error) {
      throw new BadRequestException(`Failed to parse PDF: ${error.message}`);
    }
  }

  async extractAllText(buffer: Buffer): Promise<string> {
    const pages = await this.extractTextPageByPage(buffer);
    return pages.join('\n\n');
  }
}
