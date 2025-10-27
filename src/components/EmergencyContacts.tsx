import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Phone, ExternalLink } from "lucide-react";

export const EmergencyContacts = () => {
  return (
    <Card className="shadow-lg hover:shadow-xl transition-all hover-lift gradient-card border-2 border-destructive/30">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-xl text-destructive">
          <Phone className="h-5 w-5" />
          緊急時の相談窓口
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="bg-destructive/10 p-4 rounded-lg">
          <p className="text-sm font-medium mb-3">
            つらいときは、一人で抱え込まず、以下の窓口にご相談ください
          </p>
          
          <div className="space-y-3">
            <a 
              href="tel:0570-064-556" 
              className="flex items-center justify-between p-3 bg-card rounded-lg hover:bg-secondary transition-colors"
            >
              <div>
                <p className="font-bold">こころの健康相談統一ダイヤル</p>
                <p className="text-sm text-muted-foreground">0570-064-556</p>
              </div>
              <ExternalLink className="h-4 w-4 text-muted-foreground" />
            </a>

            <a 
              href="tel:0120-279-338" 
              className="flex items-center justify-between p-3 bg-card rounded-lg hover:bg-secondary transition-colors"
            >
              <div>
                <p className="font-bold">よりそいホットライン</p>
                <p className="text-sm text-muted-foreground">0120-279-338</p>
              </div>
              <ExternalLink className="h-4 w-4 text-muted-foreground" />
            </a>

            <a 
              href="https://www.mhlw.go.jp/stf/seisakunitsuite/bunya/0000188813.html" 
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-between p-3 bg-card rounded-lg hover:bg-secondary transition-colors"
            >
              <div>
                <p className="font-bold">厚生労働省 相談窓口一覧</p>
                <p className="text-sm text-muted-foreground">その他の相談窓口を探す</p>
              </div>
              <ExternalLink className="h-4 w-4 text-muted-foreground" />
            </a>
          </div>
        </div>

        <p className="text-xs text-muted-foreground">
          ※本アプリは医療行為や診断を目的としたものではありません。症状が続く場合は、必ず医療機関を受診してください。
        </p>
      </CardContent>
    </Card>
  );
};
