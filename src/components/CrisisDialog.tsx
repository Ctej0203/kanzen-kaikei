import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Phone, MessageCircle } from "lucide-react";

interface CrisisDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const CrisisDialog = ({ open, onOpenChange }: CrisisDialogProps) => {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="text-2xl">今すぐ助けが必要ですか？</AlertDialogTitle>
          <AlertDialogDescription className="space-y-4 text-base">
            <p className="text-foreground">
              あなたの気持ちはとても大切です。専門家に相談することで、
              今の辛さを和らげる方法が見つかるかもしれません。
            </p>
            
            <div className="space-y-3 bg-muted p-4 rounded-lg">
              <div className="flex items-start gap-3">
                <Phone className="text-primary mt-1" size={20} />
                <div>
                  <h4 className="font-semibold text-foreground">いのちの電話</h4>
                  <p className="text-sm text-muted-foreground">0570-783-556（24時間対応）</p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <MessageCircle className="text-primary mt-1" size={20} />
                <div>
                  <h4 className="font-semibold text-foreground">よりそいホットライン</h4>
                  <p className="text-sm text-muted-foreground">0120-279-338（24時間対応）</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <MessageCircle className="text-primary mt-1" size={20} />
                <div>
                  <h4 className="font-semibold text-foreground">こころの健康相談統一ダイヤル</h4>
                  <p className="text-sm text-muted-foreground">0570-064-556（都道府県により時間が異なります）</p>
                </div>
              </div>
            </div>

            <p className="text-sm text-muted-foreground">
              ※緊急の場合は、最寄りの精神科救急医療機関または救急車（119番）をご利用ください。
            </p>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>閉じる</AlertDialogCancel>
          <AlertDialogAction
            onClick={() => {
              window.location.href = "tel:0570-783-556";
            }}
          >
            <Phone size={16} className="mr-2" />
            今すぐ電話する
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
