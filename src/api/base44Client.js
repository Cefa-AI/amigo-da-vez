// Mock base44 client for development & Vercel Integration
// Em localhost: Usa LocalStorage (simulado)
// Na Vercel: Usa Vercel KV (Banco de Dados) e Vercel Blob (Imagens)

const isProduction = window.location.hostname.includes('vercel.app');

class Base44Client {
    constructor() {
        this.auth = {
            me: async () => {
                const user = JSON.parse(localStorage.getItem('currentUser') || '{"id": "1", "name": "Usuário Teste", "email": "user@test.com"}');
                return user;
            },
            login: async (email, password) => {
                const user = { id: '1', name: 'Usuário Teste', email };
                localStorage.setItem('currentUser', JSON.stringify(user));
                return user;
            },
            logout: async () => {
                localStorage.removeItem('currentUser');
            }
        };

        this.entities = new Proxy({}, {
            get: (target, entityName) => {
                if (!target[entityName]) {
                    target[entityName] = new EntityManager(entityName);
                }
                return target[entityName];
            }
        });

        this.integrations = {
            Core: {
                UploadFile: async (file) => {
                    // Se estiver em produção, usa Vercel Blob
                    if (isProduction) {
                        try {
                            const response = await fetch(`/api/upload?filename=${encodeURIComponent(file.name)}`, {
                                method: 'POST',
                                body: file
                            });

                            if (!response.ok) throw new Error('Upload failed');

                            const blob = await response.json();
                            return {
                                url: blob.url,
                                filename: blob.pathname
                            };
                        } catch (e) {
                            console.error('Blob upload error:', e);
                            // Fallback para local se falhar
                        }
                    }

                    // Fallback (Localhost ou erro): Base64 simulado
                    return new Promise((resolve) => {
                        const reader = new FileReader();
                        reader.onloadend = () => {
                            resolve({
                                url: reader.result,
                                filename: file.name
                            });
                        };
                        reader.readAsDataURL(file);
                    });
                }
            }
        };
    }
}

class EntityManager {
    constructor(entityName) {
        this.entityName = entityName;
        this.storageKey = `base44_${entityName}`;
    }

    async _getAll() {
        if (isProduction) {
            try {
                const res = await fetch(`/api/data?entity=${this.entityName}`);
                if (res.ok) return await res.json();
            } catch (e) {
                console.error('KV Read Error:', e);
            }
            return [];
        } else {
            // LocalStorage Logic
            try {
                const data = localStorage.getItem(this.storageKey);
                return data ? JSON.parse(data) : [];
            } catch (e) {
                return [];
            }
        }
    }

    async _saveAll(data) {
        if (isProduction) {
            try {
                await fetch(`/api/data?entity=${this.entityName}`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(data)
                });
            } catch (e) {
                console.error('KV Write Error:', e);
            }
        } else {
            // LocalStorage Logic (com sanitização de imagens)
            try {
                const sanitizedData = data.map(item => {
                    const cleanItem = { ...item };
                    Object.keys(cleanItem).forEach(key => {
                        const value = cleanItem[key];
                        if (typeof value === 'string' && value.startsWith('data:image') && value.length > 200) {
                            cleanItem[key] = 'https://placehold.co/400x400?text=Imagem+Salva';
                        }
                    });
                    return cleanItem;
                });
                localStorage.setItem(this.storageKey, JSON.stringify(sanitizedData));
            } catch (e) {
                console.error('Storage Error:', e);
            }
        }
    }

    async filter(query = {}) {
        const items = await this._getAll();
        return items.filter(item => {
            return Object.entries(query).every(([key, value]) => {
                if (key === 'created_by') {
                    return item.created_by === value;
                }
                return item[key] === value;
            });
        });
    }

    async get(id) {
        const items = await this._getAll();
        return items.find(item => item.id === id);
    }

    async create(data) {
        const items = await this._getAll();
        let user = { email: 'anonymous@app.com' };
        try {
            user = await base44.auth.me();
        } catch (e) { }

        const newItem = {
            ...data,
            id: Date.now().toString(),
            created_by: user.email,
            created_date: new Date().toISOString(),
            updated_date: new Date().toISOString()
        };
        items.push(newItem);
        await this._saveAll(items);
        return newItem;
    }

    async update(id, data) {
        const items = await this._getAll();
        const index = items.findIndex(item => item.id === id);
        if (index !== -1) {
            items[index] = {
                ...items[index],
                ...data,
                updated_date: new Date().toISOString()
            };
            await this._saveAll(items);
            return items[index];
        }
        throw new Error('Item not found');
    }

    async delete(id) {
        const items = await this._getAll();
        const filtered = items.filter(item => item.id !== id);
        await this._saveAll(filtered);
        return true;
    }
}

export const base44 = new Base44Client();
