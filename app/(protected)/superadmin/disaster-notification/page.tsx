"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RefreshCw, AlertTriangle, CloudRain, Zap, Mountain, Sun, MapPin } from "lucide-react";

interface EarthquakeInfo {
  id: string;
  time: string;
  magnitude: number;
  intensity: string;
  location: string;
  depth: number;
  coordinates: {
    lat: number;
    lng: number;
  };
  description?: string;
}

interface WeatherAlert {
  id: string;
  time: string;
  type: string;
  level: string;
  area: string;
  description: string;
  title?: string;
  prefecture?: string;
  city?: string;
  warningDetails?: string;
  affectedAreas?: string[];
  validFrom?: string;
  validTo?: string;
  severity?: string;
  category?: string;
}

interface WeatherInfo {
  id: string;
  time: string;
  area: string;
  temperature: number;
  humidity: number;
  pressure: number;
  windSpeed: number;
  windDirection: string;
  weatherCondition: string;
  description: string;
}

// 地域定義
const REGIONS = {
  'all': { name: '全国', prefectures: [] },
  'kyushu': { 
    name: '九州', 
    prefectures: ['福岡県', '佐賀県', '長崎県', '熊本県', '大分県', '宮崎県', '鹿児島県', '沖縄県'] 
  },
  'kanto': { 
    name: '関東', 
    prefectures: ['茨城県', '栃木県', '群馬県', '埼玉県', '千葉県', '東京都', '神奈川県'] 
  },
  'kansai': { 
    name: '関西', 
    prefectures: ['滋賀県', '京都府', '大阪府', '兵庫県', '奈良県', '和歌山県'] 
  },
  'tohoku': { 
    name: '東北', 
    prefectures: ['青森県', '岩手県', '宮城県', '秋田県', '山形県', '福島県'] 
  },
  'chubu': { 
    name: '中部', 
    prefectures: ['新潟県', '富山県', '石川県', '福井県', '山梨県', '長野県', '岐阜県', '静岡県', '愛知県'] 
  },
  'chugoku': { 
    name: '中国', 
    prefectures: ['鳥取県', '島根県', '岡山県', '広島県', '山口県'] 
  },
  'shikoku': { 
    name: '四国', 
    prefectures: ['徳島県', '香川県', '愛媛県', '高知県'] 
  },
  'hokkaido': { 
    name: '北海道', 
    prefectures: ['北海道'] 
  }
} as const;

type RegionKey = keyof typeof REGIONS;

export default function DisasterNotificationPage() {
  const [earthquakeData, setEarthquakeData] = useState<EarthquakeInfo[]>([]);
  const [weatherAlerts, setWeatherAlerts] = useState<WeatherAlert[]>([]);
  const [weatherInfo, setWeatherInfo] = useState<WeatherInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [apiTestResults, setApiTestResults] = useState<{ success: boolean; source: string; tests: { success: boolean; name: string; message: string }[]; recommendations: string[] } | null>(null);
  const [currentIp, setCurrentIp] = useState<string | null>(null);
  const [selectedRegion, setSelectedRegion] = useState<RegionKey>('all');

  const getCurrentIp = async () => {
    try {
      const response = await fetch('/api/disaster/ip');
      const data = await response.json();
      setCurrentIp(data.ip);
    } catch (error) {
      console.error('Failed to get IP address:', error);
    }
  };

  const testApiConnection = async () => {
    try {
      const response = await fetch('/api/jma/test');
      const results = await response.json();
      setApiTestResults(results);
      console.log('JMA XML API Test Results:', results);
    } catch (error) {
      console.error('JMA XML API test failed:', error);
      setApiTestResults(null);
    }
  };

  // 地域フィルタリング関数
  const filterByRegion = <T extends EarthquakeInfo | WeatherAlert>(data: T[], region: RegionKey): T[] => {
    if (region === 'all') return data;
    
    const regionPrefectures = REGIONS[region].prefectures as readonly string[];
    return data.filter(item => {
      // 地震データの場合
      if ('location' in item) {
        return regionPrefectures.some(prefecture => 
          item.location?.includes(prefecture) || 
          item.description?.includes(prefecture)
        );
      }
      // 気象警報データの場合
      if ('prefecture' in item) {
        const weatherItem = item as WeatherAlert;
        return weatherItem.prefecture && (regionPrefectures as string[]).includes(weatherItem.prefecture);
      }
      return false;
    });
  };

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // 気象庁XML APIからデータを取得
      const [earthquakeResponse, weatherResponse, typhoonResponse, volcanoResponse] = await Promise.all([
        fetch('/api/jma?type=earthquake'),
        fetch('/api/jma?type=weather'),
        fetch('/api/jma?type=typhoon'),
        fetch('/api/jma?type=volcano')
      ]);
      
      const earthquakeData = await earthquakeResponse.json();
      const weatherData = await weatherResponse.json();
      const typhoonData = await typhoonResponse.json();
      const volcanoData = await volcanoResponse.json();
      
      console.log('JMA XML API data:', { 
        earthquakes: earthquakeData.data?.items?.length || 0, 
        weather: weatherData.data?.items?.length || 0,
        typhoons: typhoonData.data?.items?.length || 0,
        volcanoes: volcanoData.data?.items?.length || 0
      });
      
      // デバッグ用：各APIのレスポンスを詳細にログ出力
      console.log('Earthquake API response:', earthquakeData);
      console.log('Weather API response:', weatherData);
      console.log('Typhoon API response:', typhoonData);
      console.log('Volcano API response:', volcanoData);
      
      // サンプルデータの詳細ログ
      if (earthquakeData.data?.items?.length > 0) {
        console.log('First earthquake item:', earthquakeData.data.items[0]);
      }
      if (weatherData.data?.items?.length > 0) {
        console.log('First weather item:', weatherData.data.items[0]);
      }
      
      // データを設定
      setEarthquakeData(earthquakeData.data?.items || []);
      setWeatherAlerts(weatherData.data?.items || []);
      setWeatherInfo(weatherData.data?.items || []); // 気象警報・注意報データを天気情報としても使用
      setLastUpdated(new Date());
    } catch (err) {
      setError(err instanceof Error ? err.message : 'データの取得に失敗しました');
    } finally {
      setLoading(false);
    }
  };

  // biome-ignore lint/correctness/useExhaustiveDependencies: fetchDataを参照するため
  useEffect(() => {
    fetchData();
    
    // 5分ごとに自動更新
    const interval = setInterval(fetchData, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  const formatDateTime = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleString('ja-JP', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return dateString;
    }
  };

  return (
    <div className="mx-auto">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">災害通知</h1>
          <p className="text-muted-foreground">
            社内slack周知する用（実装進行ちゅ）
          </p>
        </div>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {currentIp && (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">現在のIPアドレス</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <p className="text-sm font-mono bg-gray-100 p-2 rounded">
                {currentIp}
              </p>
              <p className="text-xs text-muted-foreground">
                気象庁XMLはIP制限がありません
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {apiTestResults && (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">APIテスト結果</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <div className={`w-3 h-3 rounded-full ${apiTestResults.success ? 'bg-green-500' : 'bg-red-500'}`} />
                <span className="text-sm">
                  {apiTestResults.success ? 'APIテスト成功' : 'APIテスト失敗'}
                </span>
              </div>
              {apiTestResults.source && (
                <p className="text-xs text-muted-foreground">
                  データソース: {apiTestResults.source}
                </p>
              )}
              {apiTestResults.tests && (
                <div className="space-y-1">
                  {apiTestResults.tests.map((test: { success: boolean; name: string; message: string }, index: number) => (
                    <div key={test.name} className="flex items-center gap-2 text-xs">
                      <div className={`w-2 h-2 rounded-full ${test.success ? 'bg-green-500' : 'bg-red-500'}`} />
                      <span>{test.name}: {test.message}</span>
                    </div>
                  ))}
                </div>
              )}
              {apiTestResults.recommendations && (
                <div className="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
                  <h4 className="text-sm font-medium text-yellow-800 mb-2">推奨事項:</h4>
                  <ul className="text-xs text-yellow-700 space-y-1">
                    {apiTestResults.recommendations.map((rec: string) => (
                      <li key={rec} className="flex items-start gap-2">
                        <span className="text-yellow-600">•</span>
                        <span>{rec}</span>
                      </li>
                    ))}
                  </ul>
                  <div className="mt-3 p-2 bg-blue-50 border border-blue-200 rounded">
                    <h5 className="text-xs font-medium text-blue-800 mb-1">気象庁防災情報XMLについて:</h5>
                    <ol className="text-xs text-blue-700 space-y-1 list-decimal list-inside">
                      <li>気象庁が提供する公式の防災情報XML</li>
                      <li>完全無料で利用可能</li>
                      <li>APIキーや契約は不要</li>
                      <li>地震、津波、気象警報、台風、火山情報を取得</li>
                      <li>データは1-5分程度の遅延があります</li>
                    </ol>
                    <div className="mt-2 p-2 bg-green-50 border border-green-200 rounded">
                      <p className="text-xs text-green-700">
                        <strong>気象庁XMLの利点:</strong><br/>
                        • 公式の災害・気象情報<br/>
                        • 完全無料で利用可能<br/>
                        • APIキー不要<br/>
                        • 信頼性の高いデータ
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* API設定状況の表示 */}
      {/* <Card>
        <CardHeader>
          <CardTitle className="text-sm">システム状況</CardTitle>
        </CardHeader>
        <CardContent className="text-sm">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="flex items-center gap-2">
              <div className={`w-3 h-3 rounded-full ${earthquakeData.length > 0 ? 'bg-green-500' : 'bg-yellow-500'}`} />
              <span>地震データ: {earthquakeData.length > 0 ? `${earthquakeData.length}件取得` : 'データなし'}
                {selectedRegion !== 'all' && earthquakeData.length > 0 && ` (${filterByRegion(earthquakeData, selectedRegion).length}件表示)`}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <div className={`w-3 h-3 rounded-full ${weatherAlerts.length > 0 ? 'bg-green-500' : 'bg-yellow-500'}`} />
              <span>気象警報: {weatherAlerts.length > 0 ? `${weatherAlerts.length}件取得` : 'データなし'}
                {selectedRegion !== 'all' && weatherAlerts.length > 0 && ` (${filterByRegion(weatherAlerts, selectedRegion).length}件表示)`}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-blue-500" />
              <span>更新頻度: 5分間隔</span>
            </div>
          </div>
        </CardContent>
      </Card> */}

      {/* 地域選択 */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-sm flex items-center gap-2">
            <MapPin className="h-4 w-4" />
            表示地域の選択
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Select value={selectedRegion} onValueChange={(value) => setSelectedRegion(value as RegionKey)}>
            <SelectTrigger className="w-full md:w-[300px]">
              <SelectValue placeholder="地域を選択" />
            </SelectTrigger>
            <SelectContent>
              {Object.entries(REGIONS).map(([key, region]) => (
                <SelectItem key={key} value={key}>
                  {region.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <p className="text-xs text-muted-foreground mt-2">
            選択した地域の災害情報のみを表示します
          </p>
        </CardContent>
      </Card>

      <Tabs defaultValue="earthquake" className="space-y-4">
        <TabsList>
          <TabsTrigger value="earthquake" className="flex items-center gap-2">
            <Zap className="h-4 w-4" />
            地震情報
          </TabsTrigger>
          <TabsTrigger value="weather" className="flex items-center gap-2">
            <CloudRain className="h-4 w-4" />
            気象警報・注意報
          </TabsTrigger>
        </TabsList>

        <TabsContent value="earthquake" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="h-5 w-5" />
                最新の地震情報
              </CardTitle>
              <CardDescription>
                震度3以上の地震情報
              </CardDescription>
            </CardHeader>
            <CardContent className="max-h-[600px] overflow-y-auto pr-2" style={{ scrollbarWidth: 'thin', scrollbarColor: '#d1d5db #f3f4f6' }}>
              {loading ? (
                <div className="text-center py-8">
                  <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4" />
                  <p>データを読み込み中...</p>
                </div>
              ) : earthquakeData.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Mountain className="h-8 w-8 mx-auto mb-4" />
                  <p>現在、地震情報はありません</p>
                  <p className="text-xs mt-2">気象庁XMLからリアルタイムで取得</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {filterByRegion(earthquakeData, selectedRegion).map((earthquake: EarthquakeInfo) => (
                    <Card key={earthquake.id} className="border-l-4x">
                      <CardContent className="pt-4">
                        <div className="flex justify-between items-start mb-2">
                          <div className="flex items-center gap-2">
                            {earthquake.magnitude > 0 && (
                              <Badge variant="destructive">
                                M{earthquake.magnitude}
                              </Badge>
                            )}
                            {earthquake.intensity !== '不明' && (
                              <Badge variant="outline">
                                {earthquake.intensity}
                              </Badge>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {formatDateTime(earthquake.time)}
                          </p>
                        </div>
                        <h3 className="font-semibold mb-1">
                          {earthquake.location && earthquake.location !== 'No title' 
                            ? earthquake.location 
                            : earthquake.description 
                              ? earthquake.description.substring(0, 50) + (earthquake.description.length > 50 ? '...' : '')
                              : '地震情報'
                          }
                        </h3>
                        <div className="text-sm text-muted-foreground">
                          {earthquake.depth > 0 && <p>深さ: {earthquake.depth}km</p>}
                          {(earthquake.coordinates.lat > 0 || earthquake.coordinates.lng > 0) && (
                            <p>座標: {earthquake.coordinates.lat.toFixed(2)}, {earthquake.coordinates.lng.toFixed(2)}</p>
                          )}
                          {earthquake.description && (
                            <p className="mt-2 text-xs">{earthquake.description}</p>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="weather" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CloudRain className="h-5 w-5" />
                気象警報・注意報
              </CardTitle>
              <CardDescription>
                現在発表中の気象警報・注意報
              </CardDescription>
            </CardHeader>
            <CardContent className="max-h-[600px] overflow-y-auto pr-2" style={{ scrollbarWidth: 'thin', scrollbarColor: '#d1d5db #f3f4f6' }}>
              {loading ? (
                <div className="text-center py-8">
                  <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4" />
                  <p>データを読み込み中...</p>
                </div>
              ) : weatherAlerts.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <CloudRain className="h-8 w-8 mx-auto mb-4" />
                  <p>現在、気象警報・注意報はありません</p>
                  <p className="text-xs mt-2">気象庁XMLからリアルタイムで取得</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {filterByRegion(weatherAlerts, selectedRegion).map((alert: WeatherAlert) => (
                    <Card key={alert.id} className="border-l-4">
                      <CardContent className="pt-4">
                        <div className="flex justify-between items-start mb-2">
                          <div className="flex items-center gap-2">
                            {alert.level && alert.level !== '不明' && (
                              <Badge variant="destructive">
                                {alert.level}
                              </Badge>
                            )}
                            {alert.type && alert.type !== '不明' && (
                              <Badge variant="outline">
                                {alert.type}
                              </Badge>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {formatDateTime(alert.time)}
                          </p>
                        </div>
                        <h3 className="font-semibold mb-1">
                          {alert.prefecture && alert.city 
                            ? `${alert.prefecture} ${alert.city}`
                            : alert.prefecture 
                              ? alert.prefecture
                              : alert.area && alert.area !== 'No title' 
                                ? alert.area 
                                : alert.description 
                                  ? alert.description.substring(0, 50) + (alert.description.length > 50 ? '...' : '')
                                  : '気象警報'
                          }
                        </h3>
                        <div className="text-sm text-muted-foreground space-y-2">
                          {alert.category && (
                            <div className="flex items-center gap-2">
                              <Badge variant="secondary" className="text-xs">
                                {alert.category}
                              </Badge>
                              {alert.severity && (
                                <Badge variant={alert.severity === '特別警報' ? 'destructive' : alert.severity === '警報' ? 'destructive' : 'outline'} className="text-xs">
                                  {alert.severity}
                                </Badge>
                              )}
                            </div>
                          )}
                          
                          {alert.warningDetails && (
                            <p className="text-sm">{alert.warningDetails}</p>
                          )}
                          
                          {alert.affectedAreas && alert.affectedAreas.length > 0 && (
                            <div>
                              <p className="text-xs font-medium mb-1">影響地域:</p>
                              <div className="flex flex-wrap gap-1">
                                {alert.affectedAreas.slice(0, 5).map((area, index) => (
                                  <Badge key={area} variant="outline" className="text-xs">
                                    {area}
                                  </Badge>
                                ))}
                                {alert.affectedAreas.length > 5 && (
                                  <Badge variant="outline" className="text-xs">
                                    +{alert.affectedAreas.length - 5}件
                                  </Badge>
                                )}
                              </div>
                            </div>
                          )}
                          
                          {(alert.validFrom || alert.validTo) && (
                            <div className="text-xs">
                              {alert.validFrom && <p>発表時刻: {alert.validFrom}</p>}
                              {alert.validTo && <p>解除時刻: {alert.validTo}</p>}
                            </div>
                          )}
                          
                          {alert.description && !alert.warningDetails && (
                            <p className="text-xs opacity-75">{alert.description}</p>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}