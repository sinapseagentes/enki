import tkinter as tk
from tkinter import filedialog, messagebox, scrolledtext
import markdown
from fpdf import FPDF, HTMLMixin
import os
import re

class MDToPDFConverter(FPDF, HTMLMixin):
    def footer(self):
        self.set_y(-15)
        try:
            # Usa o alias definido na exportação
            self.set_font("MainFont", "I", 8)
        except:
            self.set_font("Arial", "I", 8)
        self.cell(0, 10, f"Página {self.page_no()}", 0, 0, "C")

class EnkiMergerApp:
    def __init__(self, root):
        self.root = root
        self.root.title("Enki - Merger & PDF Tool (Precision Tech)")
        self.root.geometry("1000x800")
        
        # Estética Precision Tech
        self.bg_color = "#f8f9fa"
        self.root.configure(bg=self.bg_color)
        
        self.files_to_merge = []
        self.setup_ui()

    def setup_ui(self):
        # Toolbar
        control_frame = tk.Frame(self.root, bg=self.bg_color, pady=10)
        control_frame.pack(fill=tk.X)

        btn_select = tk.Button(
            control_frame, text="📥 Selecionar Arquivos (Todos)", 
            command=self.select_files, bg="#2d2d2d", fg="white", 
            padx=15, font=("JetBrains Mono", 10, "bold")
        )
        btn_select.pack(side=tk.LEFT, padx=10)

        btn_clear = tk.Button(
            control_frame, text="🗑️ Limpar", 
            command=self.clear_content, padx=10, font=("JetBrains Mono", 10)
        )
        btn_clear.pack(side=tk.LEFT, padx=5)

        btn_pdf = tk.Button(
            control_frame, text="📄 Gerar PDF", 
            command=self.export_pdf, bg="#007acc", fg="white", 
            padx=15, font=("JetBrains Mono", 10, "bold")
        )
        btn_pdf.pack(side=tk.RIGHT, padx=10)

        # Main Viewport (Rigid Shell style)
        self.text_pane = scrolledtext.ScrolledText(
            self.root, wrap=tk.WORD, font=("JetBrains Mono", 11),
            bg="white", fg="#1e1e1e", padx=20, pady=20,
            insertbackground="#007acc", relief=tk.FLAT
        )
        self.text_pane.pack(expand=True, fill=tk.BOTH, padx=10, pady=5)

        # Status Bar
        self.status_var = tk.StringVar(value="Sistema pronto para auditoria.")
        status_bar = tk.Label(
            self.root, textvariable=self.status_var, bd=0, 
            bg="#e9ecef", anchor=tk.W, font=("ui-monospace", 9), padx=10
        )
        status_bar.pack(side=tk.BOTTOM, fill=tk.X)

    def select_files(self):
        # Requisito: Seleção TOTAL (incluindo ocultos e qualquer extensão)
        files = filedialog.askopenfilenames(
            title="Enki Selection - All Files Access",
            initialdir=os.getcwd(),
            filetypes=[("All Files", "*.*"), ("Markdown", "*.md"), ("Text Files", "*.txt")]
        )
        if files:
            self.files_to_merge = list(files) # Mantém a ordem de seleção ou pode-se usar sorted()
            self.merge_content()

    def merge_content(self):
        self.text_pane.delete(1.0, tk.END)
        merged_text = ""
        
        for file_path in self.files_to_merge:
            try:
                with open(file_path, 'r', encoding='utf-8') as f:
                    content = f.read()
                    
                    # Requisito: Caminho do arquivo como cabeçalho de cada trecho
                    header = f"### 📂 Caminho: {file_path}\n"
                    separator = "---"
                    
                    merged_text += f"{header}\n{content}\n\n{separator}\n\n" 
            except Exception as e:
                messagebox.showerror("Erro de Acesso", f"Falha ao ler {file_path}:\n{e}")

        self.text_pane.insert(tk.INSERT, merged_text)
        self.status_var.set(f"Mesclados {len(self.files_to_merge)} itens. Pronto para exportação.")

    def clear_content(self):
        self.files_to_merge = []
        self.text_pane.delete(1.0, tk.END)
        self.status_var.set("Conteúdo limpo.")

    def export_pdf(self):
        content = self.text_pane.get(1.0, tk.END).strip()
        if not content:
            messagebox.showwarning("Aviso", "Nenhum conteúdo detectado no buffer.")
            return

        save_path = filedialog.asksaveasfilename(
            defaultextension=".pdf",
            filetypes=[("PDF files", "*.pdf")],
            title="Salvar Documento Final"
        )

        if save_path:
            try:
                self.status_var.set("Generating PDF (Rigid Protocol)...")
                self.root.update_idletasks()
                
                pdf = MDToPDFConverter()
                
                # Localização de Fontes macOS
                font_candidates = [
                    "/Library/Fonts/JetBrainsMono-Regular.ttf",
                    "/Library/Fonts/JetBrainsMono-Nerd-Font-Complete.ttf",
                    os.path.expanduser("~/Library/Fonts/JetBrainsMono-Regular.ttf"),
                    "/System/Library/Fonts/Supplemental/Arial Unicode.ttf",
                    "/System/Library/Fonts/Helvetica.ttc"
                ]
                
                pdf_font = "Arial"
                font_alias = "MainFont"
                unicode_ready = False
                
                for path in font_candidates:
                    if os.path.exists(path):
                        try:
                            # Mapeamento Total de Estilos para o mesmo arquivo (Prevenção de 'Undefined Font')
                            pdf.add_font(font_alias, "", path)
                            pdf.add_font(font_alias, "B", path)
                            pdf.add_font(font_alias, "I", path)
                            pdf.add_font(font_alias, "BI", path)
                            pdf_font = font_alias
                            unicode_ready = True
                            break
                        except:
                            continue
                
                if not unicode_ready:
                    # Se não houver fonte Unicode, limpamos caracteres problemáticos
                    content = (content.replace("📂", "[FILE]")
                                     .replace("🗑️", "[DEL]")
                                     .replace("📄", "[DOC]")
                                     .replace("—", "--")  # Substitui travessão por hífen duplo
                                     .replace("–", "-"))   # Substitui meia-risca por hífen
                
                pdf.add_page()
                pdf.set_font(pdf_font, size=11)
                
                # Geração de HTML limpo
                # 'extra' é evitado pois gera IDs em headers que quebram o fpdf2
                html_content = markdown.markdown(content, extensions=['tables', 'fenced_code', 'nl2br'])

                # SANITIZAÇÃO AGRESSIVA (Anti-Crash):
                # 1. Remove tags <a> completamente (fpdf2 morre sem href)
                html_content = re.sub(r'</a>', '', html_content)
                html_content = re.sub(r'<a[^>]*>', '', html_content)
                
                # 2. Garante que entidades HTML não quebrem o parser
                html_content = html_content.replace('&nbsp;', ' ')

                # Processa o HTML e injeta no PDF
                # O try/except interno previne crash se um caractere específico não estiver no TTF
                try:
                    pdf.write_html(f'<font face="{pdf_font}" size="11">{html_content}</font>')
                except Exception as html_err:
                    # Fallback final: Texto puro sem formatação se o HTML Mixin falhar
                    pdf.add_page()
                    # Usa a fonte de sistema detectada em vez de Courier (que não é Unicode)
                    pdf.set_font(pdf_font, size=10)
                    
                    # Se a fonte não for Unicode (Arial/Courier), removemos o que ela não entende
                    safe_content = content
                    if not unicode_ready:
                        safe_content = content.encode('latin-1', 'replace').decode('latin-1')
                    pdf.multi_cell(0, 5, safe_content)
                
                pdf.output(save_path)
                self.status_var.set(f"Sucesso: {os.path.basename(save_path)} gerado.")
                messagebox.showinfo("Exportação Concluída", "O PDF foi gerado com sucesso.")
                
            except Exception as e:
                messagebox.showerror("Erro de Geração", f"Falha ao converter para PDF:\n{e}")
                self.status_var.set("Erro na exportação.")

if __name__ == "__main__":
    root = tk.Tk()
    app = EnkiMergerApp(root)
    root.mainloop()
