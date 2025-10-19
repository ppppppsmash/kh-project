import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type') || 'earthquake';
    
    // 気象庁防災情報XMLのRSSフィードURL
    let xmlUrl = '';
    
    switch (type) {
      case 'earthquake':
        // 地震・津波関連情報
        xmlUrl = 'https://www.data.jma.go.jp/developer/xml/feed/eqvol.xml';
        break;
      case 'tsunami':
        // 津波情報（地震・津波と同じフィード）
        xmlUrl = 'https://www.data.jma.go.jp/developer/xml/feed/eqvol.xml';
        break;
      case 'weather':
        // 気象警報・注意報
        xmlUrl = 'https://www.data.jma.go.jp/developer/xml/feed/extra.xml';
        break;
      case 'typhoon':
        // 台風情報（気象警報・注意報と同じフィード）
        xmlUrl = 'https://www.data.jma.go.jp/developer/xml/feed/extra.xml';
        break;
      case 'volcano':
        // 火山情報（地震・津波と同じフィード）
        xmlUrl = 'https://www.data.jma.go.jp/developer/xml/feed/eqvol.xml';
        break;
      default:
        xmlUrl = 'https://www.data.jma.go.jp/developer/xml/feed/eqvol.xml';
    }

    console.log('Fetching JMA XML data from:', xmlUrl);
    
    const response = await fetch(xmlUrl, {
      method: 'GET',
      headers: {
        'User-Agent': 'Next.js Disaster Notification App',
        'Accept': 'application/xml, text/xml, */*'
      }
    });

    if (!response.ok) {
      console.error('JMA XML API error:', response.status, response.statusText);
      return NextResponse.json(
        { 
          error: `JMA XML API failed: ${response.status}`,
          status: response.status
        },
        { status: response.status }
      );
    }

    const xmlText = await response.text();
    console.log('JMA XML response length:', xmlText.length);
    
    // XMLをパースしてJSONに変換
    const parsedData = parseJMAXML(xmlText, type);
    
    return NextResponse.json({
      success: true,
      type,
      source: 'JMA (Japan Meteorological Agency) XML',
      data: parsedData,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('JMA XML API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// 気象庁のXMLをパースする関数
function parseJMAXML(xmlText: string, type: string) {
  try {
    const items: any[] = [];
    
    console.log('Parsing XML text length:', xmlText.length);
    console.log('XML preview:', xmlText.substring(0, 500));
    
    // Atom形式のエントリーを検索
    const atomEntryMatches = xmlText.match(/<entry>[\s\S]*?<\/entry>/g);
    // RSS形式のアイテムを検索
    const rssItemMatches = xmlText.match(/<item>[\s\S]*?<\/item>/g);
    
    const entryMatches = atomEntryMatches || rssItemMatches;
    
    console.log('Found entries:', entryMatches?.length || 0);
    
    if (entryMatches) {
      entryMatches.forEach((entryXml, index) => {
        console.log(`Processing entry ${index}:`, entryXml.substring(0, 200));
        console.log(`Full entry XML:`, entryXml);
        
        // より柔軟なタイトル抽出（CDATA有無両対応）
        const titlePatterns = [
          /<title><!\[CDATA\[(.*?)\]\]><\/title>/,
          /<title>(.*?)<\/title>/,
          /<title[^>]*>(.*?)<\/title>/
        ];
        
        const descriptionPatterns = [
          /<summary><!\[CDATA\[(.*?)\]\]><\/summary>/,
          /<description><!\[CDATA\[(.*?)\]\]><\/description>/,
          /<content><!\[CDATA\[(.*?)\]\]><\/content>/,
          /<summary>(.*?)<\/summary>/,
          /<description>(.*?)<\/description>/,
          /<content>(.*?)<\/content>/,
          /<summary[^>]*>(.*?)<\/summary>/,
          /<description[^>]*>(.*?)<\/description>/,
          /<content[^>]*>(.*?)<\/content>/
        ];
        
        const datePatterns = [
          /<updated>(.*?)<\/updated>/,
          /<pubDate>(.*?)<\/pubDate>/,
          /<published>(.*?)<\/published>/,
          /<updated[^>]*>(.*?)<\/updated>/,
          /<pubDate[^>]*>(.*?)<\/pubDate>/
        ];
        
        const linkPatterns = [
          /<link[^>]*href="([^"]*)"[^>]*>/,
          /<link>(.*?)<\/link>/,
          /<link[^>]*>(.*?)<\/link>/
        ];
        
        const idPatterns = [
          /<id>(.*?)<\/id>/,
          /<guid>(.*?)<\/guid>/,
          /<id[^>]*>(.*?)<\/id>/,
          /<guid[^>]*>(.*?)<\/guid>/
        ];
        
        // タイトル抽出
        let title = 'No title';
        for (const pattern of titlePatterns) {
          const match = entryXml.match(pattern);
          const extractedTitle = match?.[1]?.trim();
          if (extractedTitle) {
            title = extractedTitle;
            break;
          }
        }
        
        // 説明抽出
        let description = 'No description';
        for (const pattern of descriptionPatterns) {
          const match = entryXml.match(pattern);
          const extractedDescription = match?.[1]?.trim();
          if (extractedDescription) {
            description = extractedDescription;
            break;
          }
        }
        
        // 日付抽出
        let pubDate = new Date().toISOString();
        for (const pattern of datePatterns) {
          const match = entryXml.match(pattern);
          const extractedPubDate = match?.[1]?.trim();
          if (extractedPubDate) {
            pubDate = extractedPubDate;
            break;
          }
        }
        
        // リンク抽出
        let link = '';
        for (const pattern of linkPatterns) {
          const match = entryXml.match(pattern);
          const extractedLink = match?.[1]?.trim();
          if (extractedLink) {
            link = extractedLink;
            break;
          }
        }
        
        // ID抽出
        let guid = '';
        for (const pattern of idPatterns) {
          const match = entryXml.match(pattern);
          const extractedGuid = match?.[1]?.trim();
          if (extractedGuid) {
            guid = extractedGuid;
            break;
          }
        }
        
        console.log(`Entry ${index} parsed:`, { 
          title, 
          description: description.substring(0, 200),
          pubDate,
          link,
          guid
        });
        
        // 気象警報の場合は詳細な情報をログ出力
        if (type === 'weather') {
          console.log(`Weather alert details for entry ${index}:`, {
            title,
            description: description.substring(0, 500),
            link
          });
        }
        
        // データタイプに応じて構造化
        let structuredData: any = {
          id: `jma_${type}_${index}`,
          time: pubDate,
          type: type,
          title: title,
          description: description,
          link: link,
          guid: guid,
          source: 'JMA'
        };
        
        // タイプ別の詳細情報を抽出
        switch (type) {
          case 'earthquake':
            structuredData = {
              ...structuredData,
              magnitude: extractMagnitude(title),
              depth: extractDepth(description),
              location: extractLocation(title),
              intensity: extractIntensity(title),
              coordinates: extractCoordinates(description)
            };
            break;
            
          case 'tsunami':
            structuredData = {
              ...structuredData,
              warningLevel: extractWarningLevel(title),
              area: extractArea(title),
              height: extractTsunamiHeight(description)
            };
            break;
            
          case 'weather':
            structuredData = {
              ...structuredData,
              warningType: extractWarningType(title),
              area: extractArea(title),
              level: extractWarningLevel(title),
              prefecture: extractPrefecture(title),
              city: extractCity(title),
              warningDetails: extractWarningDetails(description),
              affectedAreas: extractAffectedAreas(description),
              validFrom: extractValidFrom(description),
              validTo: extractValidTo(description),
              severity: extractSeverity(title),
              category: extractCategory(title)
            };
            break;
            
          case 'typhoon':
            structuredData = {
              ...structuredData,
              name: extractTyphoonName(title),
              intensity: extractTyphoonIntensity(title),
              pressure: extractPressure(description),
              windSpeed: extractWindSpeed(description)
            };
            break;
            
          case 'volcano':
            structuredData = {
              ...structuredData,
              name: extractVolcanoName(title),
              level: extractAlertLevel(title),
              area: extractArea(title),
              details: extractWarningDetails(description)
            };
            break;
        }
        
        items.push(structuredData);
      });
    }
    
    return {
      items,
      count: items.length,
      lastUpdated: new Date().toISOString()
    };
  } catch (error) {
    console.error('XML parsing error:', error);
    return {
      items: [],
      count: 0,
      error: 'Failed to parse XML',
      lastUpdated: new Date().toISOString()
    };
  }
}

// ヘルパー関数群
function extractMagnitude(text: string): number {
  // より柔軟なマグニチュード抽出
  const patterns = [
    /M(\d+\.?\d*)/,
    /マグニチュード\s*(\d+\.?\d*)/,
    /M\s*(\d+\.?\d*)/,
    /震度.*?M(\d+\.?\d*)/
  ];
  
  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match) {
      return parseFloat(match[1]);
    }
  }
  return 0;
}

function extractDepth(text: string): number {
  // より柔軟な深さ抽出
  const patterns = [
    /深さ\s*(\d+)/,
    /深さ\s*約\s*(\d+)/,
    /震源の深さ\s*(\d+)/,
    /深度\s*(\d+)/
  ];
  
  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match) {
      return parseInt(match[1]);
    }
  }
  return 0;
}

function extractLocation(text: string): string {
  // より柔軟な場所抽出
  const patterns = [
    /([都道府県]+)/,
    /([都道府県]+[市区町村]+)/,
    /([都道府県]+[市区町村]+[字町名]+)/,
    /([都道府県]+[市区町村]+[字町名]+[番地]+)/
  ];
  
  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match) {
      return match[1];
    }
  }
  
  // タイトルから場所を抽出できない場合は、タイトル全体を返す
  return text.length > 50 ? text.substring(0, 50) + '...' : text;
}

function extractIntensity(text: string): string {
  // より柔軟な震度抽出
  const patterns = [
    /震度(\d+)/,
    /震度\s*(\d+)/,
    /最大震度\s*(\d+)/,
    /震度\s*(\d+)\s*以上/
  ];
  
  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match) {
      return `震度${match[1]}`;
    }
  }
  return '不明';
}

function extractCoordinates(text: string): { lat: number; lng: number } {
  // より柔軟な座標抽出
  const latPatterns = [
    /北緯(\d+\.?\d*)/,
    /緯度\s*(\d+\.?\d*)/,
    /北緯\s*(\d+\.?\d*)/
  ];
  
  const lngPatterns = [
    /東経(\d+\.?\d*)/,
    /経度\s*(\d+\.?\d*)/,
    /東経\s*(\d+\.?\d*)/
  ];
  
  let lat = 0;
  let lng = 0;
  
  for (const pattern of latPatterns) {
    const match = text.match(pattern);
    if (match) {
      lat = parseFloat(match[1]);
      break;
    }
  }
  
  for (const pattern of lngPatterns) {
    const match = text.match(pattern);
    if (match) {
      lng = parseFloat(match[1]);
      break;
    }
  }
  return { lat, lng };
}

function extractWarningLevel(text: string): string {
  if (text.includes('警報')) return '警報';
  if (text.includes('注意報')) return '注意報';
  if (text.includes('特別警報')) return '特別警報';
  return '不明';
}

function extractArea(text: string): string {
  // より柔軟な地域抽出
  const patterns = [
    /([都道府県]+)/,
    /([都道府県]+[市区町村]+)/,
    /([都道府県]+[市区町村]+[字町名]+)/
  ];
  
  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match) {
      return match[1];
    }
  }
  
  // タイトルから地域を抽出できない場合は、タイトル全体を返す
  return text.length > 30 ? text.substring(0, 30) + '...' : text;
}

function extractTsunamiHeight(text: string): string {
  const match = text.match(/(\d+\.?\d*)\s*m/);
  return match ? `${match[1]}m` : '不明';
}

function extractWarningType(text: string): string {
  const warningTypes = [
    '大雨', '洪水', '暴風', '大雪', '波浪', '高潮', 
    '雷', '濃霧', '乾燥', 'なだれ', '低温', '霜', 
    '着氷', '着雪', '融雪', '浸水', '土砂災害'
  ];
  
  for (const type of warningTypes) {
    if (text.includes(type)) {
      return type;
    }
  }
  
  // タイトルから警報タイプを抽出できない場合は、タイトル全体を返す
  return text.length > 20 ? text.substring(0, 20) + '...' : text;
}

function extractTyphoonName(text: string): string {
  const match = text.match(/台風第(\d+)号/);
  return match ? `台風第${match[1]}号` : '不明';
}

function extractTyphoonType(text: string): string {
  if (text.includes('台風')) return '台風';
  return '不明';
}

function extractTyphoonIntensity(text: string): string {
  if (text.includes('猛烈な')) return '猛烈な';
  if (text.includes('非常に強い')) return '非常に強い';
  if (text.includes('強い')) return '強い';
  if (text.includes('並の')) return '並の';
  return '不明';
}

function extractPressure(text: string): number {
  const match = text.match(/(\d+)\s*hPa/);
  return match ? parseInt(match[1]) : 0;
}

function extractWindSpeed(text: string): number {
  const match = text.match(/(\d+)\s*m\/s/);
  return match ? parseInt(match[1]) : 0;
}

function extractAlertLevel(text: string): string {
  const match = text.match(/レベル(\d+)/);
  return match ? `レベル${match[1]}` : '不明';
}

// 気象警報用の新しい抽出関数
function extractPrefecture(text: string): string {
  // 気象庁のXMLデータの形式に対応
  // 【福岡県気象警報・注意報】から都道府県名を抽出
  
  const prefectures = [
    '北海道', '青森県', '岩手県', '宮城県', '秋田県', '山形県', '福島県',
    '茨城県', '栃木県', '群馬県', '埼玉県', '千葉県', '東京都', '神奈川県',
    '新潟県', '富山県', '石川県', '福井県', '山梨県', '長野県', '岐阜県',
    '静岡県', '愛知県', '三重県', '滋賀県', '京都府', '大阪府', '兵庫県',
    '奈良県', '和歌山県', '鳥取県', '島根県', '岡山県', '広島県', '山口県',
    '徳島県', '香川県', '愛媛県', '高知県', '福岡県', '佐賀県', '長崎県',
    '熊本県', '大分県', '宮崎県', '鹿児島県', '沖縄県'
  ];
  
  // 【都道府県気象警報・注意報】の形式から抽出
  const bracketPattern = /【(.+?)気象/;
  const bracketMatch = text.match(bracketPattern);
  if (bracketMatch && bracketMatch[1]) {
    const extracted = bracketMatch[1].trim();
    if (prefectures.includes(extracted)) {
      return extracted;
    }
  }
  
  // 通常の検索
  for (const prefecture of prefectures) {
    if (text.includes(prefecture)) {
      return prefecture;
    }
  }
  
  return '';
}

function extractCity(text: string): string {
  // 主要都市の抽出
  const cities = [
    '札幌市', '仙台市', 'さいたま市', '千葉市', '横浜市', '川崎市', '相模原市',
    '新潟市', '富山市', '金沢市', '福井市', '甲府市', '長野市', '岐阜市',
    '静岡市', '浜松市', '名古屋市', '津市', '大津市', '京都市', '大阪市',
    '堺市', '神戸市', '奈良市', '和歌山市', '鳥取市', '松江市', '岡山市',
    '広島市', '山口市', '徳島市', '高松市', '松山市', '高知市', '福岡市',
    '北九州市', '佐賀市', '長崎市', '熊本市', '大分市', '宮崎市', '鹿児島市',
    '那覇市'
  ];
  
  for (const city of cities) {
    if (text.includes(city)) {
      return city;
    }
  }
  
  return '';
}

function extractWarningDetails(text: string): string {
  // 気象庁のXMLデータの形式に対応
  // 【福岡県気象警報・注意報】福岡、北九州地方では、高波に注意してください。福岡県では、急な強い雨や落雷に注意してください。
  
  // 【都道府県気象警報・注意報】の部分を除去して詳細情報を抽出
  const patterns = [
    /【.*?気象.*?】(.+)/,  // 【福岡県気象警報・注意報】の後の部分
    /警報の詳細[：:]\s*(.+?)(?:\n|$)/,
    /注意報の詳細[：:]\s*(.+?)(?:\n|$)/,
    /特別警報の詳細[：:]\s*(.+?)(?:\n|$)/,
    /詳細[：:]\s*(.+?)(?:\n|$)/
  ];
  
  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match && match[1]) {
      return match[1].trim();
    }
  }
  
  // パターンにマッチしない場合は、テキスト全体を返す
  return text.trim();
}

function extractAffectedAreas(text: string): string[] {
  // 影響を受ける地域を抽出
  const areas: string[] = [];
  const prefectures = [
    '北海道', '青森県', '岩手県', '宮城県', '秋田県', '山形県', '福島県',
    '茨城県', '栃木県', '群馬県', '埼玉県', '千葉県', '東京都', '神奈川県',
    '新潟県', '富山県', '石川県', '福井県', '山梨県', '長野県', '岐阜県',
    '静岡県', '愛知県', '三重県', '滋賀県', '京都府', '大阪府', '兵庫県',
    '奈良県', '和歌山県', '鳥取県', '島根県', '岡山県', '広島県', '山口県',
    '徳島県', '香川県', '愛媛県', '高知県', '福岡県', '佐賀県', '長崎県',
    '熊本県', '大分県', '宮崎県', '鹿児島県', '沖縄県'
  ];
  
  for (const prefecture of prefectures) {
    if (text.includes(prefecture)) {
      areas.push(prefecture);
    }
  }
  
  return areas;
}

function extractValidFrom(text: string): string {
  const patterns = [
    /発表時刻[：:]\s*(\d{4}年\d{1,2}月\d{1,2}日\d{1,2}時\d{1,2}分)/,
    /発表[：:]\s*(\d{4}年\d{1,2}月\d{1,2}日\d{1,2}時\d{1,2}分)/,
    /(\d{4}年\d{1,2}月\d{1,2}日\d{1,2}時\d{1,2}分)発表/
  ];
  
  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match && match[1]) {
      return match[1];
    }
  }
  
  return '';
}

function extractValidTo(text: string): string {
  const patterns = [
    /解除時刻[：:]\s*(\d{4}年\d{1,2}月\d{1,2}日\d{1,2}時\d{1,2}分)/,
    /解除[：:]\s*(\d{4}年\d{1,2}月\d{1,2}日\d{1,2}時\d{1,2}分)/,
    /(\d{4}年\d{1,2}月\d{1,2}日\d{1,2}時\d{1,2}分)解除/
  ];
  
  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match && match[1]) {
      return match[1];
    }
  }
  
  return '';
}

function extractSeverity(text: string): string {
  if (text.includes('特別警報')) return '特別警報';
  if (text.includes('警報')) return '警報';
  if (text.includes('注意報')) return '注意報';
  return '情報';
}

function extractCategory(text: string): string {
  // 気象庁のXMLデータの形式に対応
  // 高波、急な強い雨、落雷、強風などからカテゴリを抽出
  
  const categories = [
    '大雨', '洪水', '暴風', '大雪', '波浪', '高潮', '雷', '濃霧', '乾燥',
    'なだれ', '低温', '霜', '着氷', '着雪', '融雪', '浸水', '土砂災害',
    '竜巻', '熱中症', '雪崩', '火山', '地震', '津波', '高波', '落雷', '強風'
  ];
  
  // より具体的な検索
  if (text.includes('高波')) return '高波';
  if (text.includes('落雷')) return '落雷';
  if (text.includes('強風')) return '強風';
  if (text.includes('急な強い雨')) return '大雨';
  if (text.includes('大雨')) return '大雨';
  if (text.includes('洪水')) return '洪水';
  if (text.includes('暴風')) return '暴風';
  if (text.includes('大雪')) return '大雪';
  if (text.includes('波浪')) return '波浪';
  if (text.includes('高潮')) return '高潮';
  if (text.includes('雷')) return '雷';
  if (text.includes('濃霧')) return '濃霧';
  if (text.includes('乾燥')) return '乾燥';
  if (text.includes('なだれ')) return 'なだれ';
  if (text.includes('低温')) return '低温';
  if (text.includes('霜')) return '霜';
  if (text.includes('着氷')) return '着氷';
  if (text.includes('着雪')) return '着雪';
  if (text.includes('融雪')) return '融雪';
  if (text.includes('浸水')) return '浸水';
  if (text.includes('土砂災害')) return '土砂災害';
  if (text.includes('竜巻')) return '竜巻';
  if (text.includes('熱中症')) return '熱中症';
  if (text.includes('雪崩')) return '雪崩';
  if (text.includes('火山')) return '火山';
  if (text.includes('地震')) return '地震';
  if (text.includes('津波')) return '津波';
  
  return 'その他';
}

function extractVolcanoName(text: string): string {
  // 火山名の抽出（例：桜島、阿蘇山など）
  const volcanoPatterns = [
    /([山]+)/,
    /([島]+)/,
    /([岳]+)/
  ];
  
  for (const pattern of volcanoPatterns) {
    const match = text.match(pattern);
    if (match && match[1]) {
      return match[1];
    }
  }
  
  return '不明';
}
