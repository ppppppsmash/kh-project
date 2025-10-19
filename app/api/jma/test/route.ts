import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const results: any = {
      success: true,
      source: 'JMA (Japan Meteorological Agency) XML',
      tests: []
    };

    // 1. 地震・津波情報APIテスト
    try {
      const earthquakeResponse = await fetch('https://www.data.jma.go.jp/developer/xml/feed/eqvol.xml', {
        method: 'GET',
        headers: {
          'User-Agent': 'Next.js Disaster Notification App',
          'Accept': 'application/xml, text/xml, */*'
        }
      });

      results.tests.push({
        name: 'JMA 地震・津波情報XML',
        status: earthquakeResponse.status,
        success: earthquakeResponse.ok,
        message: earthquakeResponse.ok ? '地震・津波情報XML接続成功' : `接続失敗 (${earthquakeResponse.status})`
      });

      if (earthquakeResponse.ok) {
        const xmlText = await earthquakeResponse.text();
        // Atom形式とRSS形式の両方をカウント
        const atomEntryCount = (xmlText.match(/<entry>/g) || []).length;
        const rssItemCount = (xmlText.match(/<item>/g) || []).length;
        const totalCount = atomEntryCount + rssItemCount;
        results.tests.push({
          name: '地震・津波情報データ',
          success: true,
          message: `取得件数: ${totalCount}件 (Atom: ${atomEntryCount}, RSS: ${rssItemCount})`,
          itemCount: totalCount
        });
      } else {
        const errorText = await earthquakeResponse.text();
        results.tests.push({
          name: '地震・津波情報エラー詳細',
          success: false,
          message: errorText,
          errorCode: earthquakeResponse.status
        });
      }
    } catch (error) {
      results.tests.push({
        name: '地震・津波情報XML エラー',
        success: false,
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }

    // 2. 気象警報・注意報APIテスト
    try {
      const weatherResponse = await fetch('https://www.data.jma.go.jp/developer/xml/feed/extra.xml', {
        method: 'GET',
        headers: {
          'User-Agent': 'Next.js Disaster Notification App',
          'Accept': 'application/xml, text/xml, */*'
        }
      });

      results.tests.push({
        name: 'JMA 気象警報・注意報XML',
        status: weatherResponse.status,
        success: weatherResponse.ok,
        message: weatherResponse.ok ? '気象警報・注意報XML接続成功' : `接続失敗 (${weatherResponse.status})`
      });

      if (weatherResponse.ok) {
        const xmlText = await weatherResponse.text();
        // Atom形式とRSS形式の両方をカウント
        const atomEntryCount = (xmlText.match(/<entry>/g) || []).length;
        const rssItemCount = (xmlText.match(/<item>/g) || []).length;
        const totalCount = atomEntryCount + rssItemCount;
        results.tests.push({
          name: '気象警報・注意報データ',
          success: true,
          message: `取得件数: ${totalCount}件 (Atom: ${atomEntryCount}, RSS: ${rssItemCount})`,
          itemCount: totalCount
        });
      } else {
        const errorText = await weatherResponse.text();
        results.tests.push({
          name: '気象警報・注意報エラー詳細',
          success: false,
          message: errorText,
          errorCode: weatherResponse.status
        });
      }
    } catch (error) {
      results.tests.push({
        name: '気象警報・注意報XML エラー',
        success: false,
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }

    // 3. 台風情報APIテスト（気象警報・注意報と同じフィードを使用）
    try {
      const typhoonResponse = await fetch('https://www.data.jma.go.jp/developer/xml/feed/extra.xml', {
        method: 'GET',
        headers: {
          'User-Agent': 'Next.js Disaster Notification App',
          'Accept': 'application/xml, text/xml, */*'
        }
      });

      results.tests.push({
        name: 'JMA 台風情報XML',
        status: typhoonResponse.status,
        success: typhoonResponse.ok,
        message: typhoonResponse.ok ? '台風情報XML接続成功' : `接続失敗 (${typhoonResponse.status})`
      });

      if (typhoonResponse.ok) {
        const xmlText = await typhoonResponse.text();
        // Atom形式とRSS形式の両方をカウント
        const atomEntryCount = (xmlText.match(/<entry>/g) || []).length;
        const rssItemCount = (xmlText.match(/<item>/g) || []).length;
        const totalCount = atomEntryCount + rssItemCount;
        results.tests.push({
          name: '台風情報データ',
          success: true,
          message: `取得件数: ${totalCount}件 (Atom: ${atomEntryCount}, RSS: ${rssItemCount})`,
          itemCount: totalCount
        });
      } else {
        const errorText = await typhoonResponse.text();
        results.tests.push({
          name: '台風情報エラー詳細',
          success: false,
          message: errorText,
          errorCode: typhoonResponse.status
        });
      }
    } catch (error) {
      results.tests.push({
        name: '台風情報XML エラー',
        success: false,
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }

    // 4. 火山情報APIテスト（地震・津波と同じフィードを使用）
    try {
      const volcanoResponse = await fetch('https://www.data.jma.go.jp/developer/xml/feed/eqvol.xml', {
        method: 'GET',
        headers: {
          'User-Agent': 'Next.js Disaster Notification App',
          'Accept': 'application/xml, text/xml, */*'
        }
      });

      results.tests.push({
        name: 'JMA 火山情報XML',
        status: volcanoResponse.status,
        success: volcanoResponse.ok,
        message: volcanoResponse.ok ? '火山情報XML接続成功' : `接続失敗 (${volcanoResponse.status})`
      });

      if (volcanoResponse.ok) {
        const xmlText = await volcanoResponse.text();
        // Atom形式とRSS形式の両方をカウント
        const atomEntryCount = (xmlText.match(/<entry>/g) || []).length;
        const rssItemCount = (xmlText.match(/<item>/g) || []).length;
        const totalCount = atomEntryCount + rssItemCount;
        results.tests.push({
          name: '火山情報データ',
          success: true,
          message: `取得件数: ${totalCount}件 (Atom: ${atomEntryCount}, RSS: ${rssItemCount})`,
          itemCount: totalCount
        });
      } else {
        const errorText = await volcanoResponse.text();
        results.tests.push({
          name: '火山情報エラー詳細',
          success: false,
          message: errorText,
          errorCode: volcanoResponse.status
        });
      }
    } catch (error) {
      results.tests.push({
        name: '火山情報XML エラー',
        success: false,
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }

    return NextResponse.json({
      ...results,
      message: 'JMA XML API test completed',
      recommendations: [
        '気象庁防災情報XMLは無料で利用可能です',
        '公式の災害・気象情報をリアルタイムで取得できます',
        'APIキーや契約は不要です',
        'データは1-5分程度の遅延があります'
      ]
    });

  } catch (error) {
    console.error('JMA XML API test error:', error);
    return NextResponse.json(
      { 
        success: false,
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
