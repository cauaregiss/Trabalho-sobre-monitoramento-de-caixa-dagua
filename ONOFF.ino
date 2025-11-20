// LED configurado para pino digital 8 conforme informado pelo usuário
const int led = 8;

void setup() {
  pinMode(led, OUTPUT);
  digitalWrite(led, LOW); // garante que começa desligado
  Serial.begin(9600);
  #if defined(USBCON)
    while (!Serial) { ; } // aguarda Serial em placas USB nativas
  #endif
  Serial.println("Pronto - envie '1'/'0' ou 'ON'/'OFF'");
}

void loop() {
  if (Serial.available() > 0) {
    String comando = Serial.readStringUntil('\n');
    comando.trim();
    comando.toLowerCase(); // normaliza para minúsculas

    if (comando == "1" || comando == "on" || comando == "a") {
      digitalWrite(led, HIGH);
      Serial.println("LED LIGADO");
    } else if (comando == "0" || comando == "off") {
      digitalWrite(led, LOW);
      Serial.println("LED DESLIGADO");
    } else if (comando == "toggle") {
      int state = digitalRead(led);
      digitalWrite(led, state == HIGH ? LOW : HIGH);
      Serial.println(state == HIGH ? "LED DESLIGADO" : "LED LIGADO");
    } else {
      Serial.print("Comando desconhecido: ");
      Serial.println(comando);
    }

    delay(50); // pequena pausa para estabilidade
  }
}
