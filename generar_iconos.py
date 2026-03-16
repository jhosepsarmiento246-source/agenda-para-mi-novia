"""
Genera los íconos PNG para la PWA (corazón marrón)
Ejecutar: python3 generar_iconos.py
"""
from PIL import Image, ImageDraw, ImageFont
import os

os.makedirs('icons', exist_ok=True)

SIZES = [16, 32, 48, 72, 96, 144, 152, 180, 192, 512]

BG_COLOR    = (107, 58, 42)      # brown-main
HEART_COLOR = (240, 224, 208)    # brown-cream

def dibujar_corazon(draw, cx, cy, size):
    """Dibuja un corazón centrado"""
    s = size * 0.38
    # Dos círculos superiores
    r = s * 0.5
    draw.ellipse([cx - s - r, cy - r*1.1, cx - s + r, cy + r*0.9], fill=HEART_COLOR)
    draw.ellipse([cx + s - r, cy - r*1.1, cx + s + r, cy + r*0.9], fill=HEART_COLOR)
    # Triángulo inferior
    puntos = [
        (cx - s*1.4, cy + r*0.4),
        (cx + s*1.4, cy + r*0.4),
        (cx,          cy + s*1.9)
    ]
    draw.polygon(puntos, fill=HEART_COLOR)

for size in SIZES:
    img = Image.new('RGBA', (size, size), (0, 0, 0, 0))
    draw = ImageDraw.Draw(img)
    
    # Fondo redondeado
    radius = size // 5
    draw.rounded_rectangle([0, 0, size, size], radius=radius, fill=BG_COLOR)
    
    # Corazón
    dibujar_corazon(draw, size // 2, size // 2, size)
    
    img.save(f'icons/icon-{size}.png', 'PNG')
    print(f'✅ icon-{size}.png creado')

# Alias necesarios
import shutil
if os.path.exists('icons/icon-192.png'):
    shutil.copy('icons/icon-192.png', 'icons/icon-maskable.png')
    print('✅ icon-maskable.png creado')

print('\n🤎 ¡Todos los íconos listos!')
