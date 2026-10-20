/** 시드 오프닝 한 개의 번역문. 키는 시드의 한국어 name(백·흑 통틀어 유일), comments 키는 시드와 같은 수 경로('d4 d5 Bf4'). */
export interface SeedText {
  name: string
  description: string
  comments?: Record<string, string>
}
