// Chaque exercice : code à trous. Les trous sont notés ___1___, ___2___, ...
// `answers[i]` = liste des réponses acceptées pour le trou i+1 (comparées sans espaces).
export const EXERCISES = [
  {
    id: 'tensors-basics',
    level: 1,
    title: 'Créer des tenseurs',
    concept: 'Tenseurs',
    statement:
      "Crée un tenseur de zéros de forme (2, 3), un tenseur à partir d'une liste Python, puis affiche sa forme.",
    code: `import torch

a = torch.___1___((2, 3))
b = torch.___2___([1.0, 2.0, 3.0])
print(a.___3___)  # torch.Size([2, 3])`,
    answers: [['zeros'], ['tensor'], ['shape', 'size()']],
    hint: 'zeros / tensor ; la forme est un attribut (pas une méthode) : .shape',
  },
  {
    id: 'tensor-ops',
    level: 1,
    title: 'Opérations et broadcasting',
    concept: 'Tenseurs',
    statement:
      'x est de forme (3, 1) et y de forme (1, 4). Calcule leur somme (broadcasting) puis le produit matriciel de A (2×3) par B (3×4).',
    code: `import torch

x = torch.ones(3, 1)
y = torch.ones(1, 4)
z = x ___1___ y            # forme (3, 4)

A = torch.rand(2, 3)
B = torch.rand(3, 4)
C = A ___2___ B            # forme (2, 4)
print(z.shape, C.shape)`,
    answers: [['+'], ['@']],
    hint: "Le broadcasting étend les dimensions de taille 1. Le produit matriciel s'écrit @ (ou torch.matmul).",
  },
  {
    id: 'indexing-reshape',
    level: 1,
    title: 'Indexation et reshape',
    concept: 'Tenseurs',
    statement: 'Remets à plat un tenseur (2, 3, 4) en (2, 12), puis prends la 1re colonne de la matrice m.',
    code: `import torch

t = torch.arange(24).___1___(2, -1)   # (2, 12)
m = torch.arange(6).reshape(2, 3)
col = m[___2___, 0]                  # toutes les lignes, colonne 0
print(t.shape, col)`,
    answers: [['reshape', 'view'], [':']],
    hint: "-1 laisse PyTorch déduire la dimension. ':' sélectionne tout sur un axe.",
  },
  {
    id: 'autograd',
    level: 2,
    title: 'Autograd : calculer un gradient',
    concept: 'Autograd',
    statement: 'Pour y = x² avec x = 3, calcule dy/dx = 6 grâce à la différentiation automatique.',
    code: `import torch

x = torch.tensor(3.0, ___1___=True)
y = x ** 2
y.___2___()
print(x.___3___)  # tensor(6.)`,
    answers: [['requires_grad'], ['backward'], ['grad']],
    hint: "On suit le gradient avec requires_grad=True, on le propage avec .backward(), on le lit dans .grad.",
  },
  {
    id: 'no-grad',
    level: 2,
    title: "Désactiver le calcul de gradient",
    concept: 'Autograd',
    statement: "À l'inférence on ne veut pas construire le graphe de calcul. Complète le bloc.",
    code: `import torch

model = torch.nn.Linear(4, 1)
x = torch.rand(8, 4)

with torch.___1___():
    pred = model(x)
print(pred.requires_grad)  # False`,
    answers: [['no_grad', 'inference_mode']],
    hint: 'Un gestionnaire de contexte qui commence par no_',
  },
  {
    id: 'module',
    level: 2,
    title: 'Écrire un nn.Module',
    concept: 'nn.Module',
    statement: 'Définis un petit réseau : Linear(10→32), ReLU, Linear(32→2).',
    code: `import torch
import torch.nn as nn

class Net(nn.Module):
    def __init__(self):
        super().__init__()
        self.fc1 = nn.Linear(10, ___1___)
        self.fc2 = nn.Linear(32, 2)

    def ___2___(self, x):
        x = torch.___3___(self.fc1(x))
        return self.fc2(x)`,
    answers: [['32'], ['forward'], ['relu']],
    hint: "La dimension de sortie de fc1 = entrée de fc2. La méthode appelée par model(x) s'appelle forward.",
  },
  {
    id: 'train-loop',
    level: 3,
    title: "La boucle d'entraînement",
    concept: 'Entraînement',
    statement: "Complète les 4 étapes classiques d'une itération : remise à zéro, forward+loss, backward, mise à jour.",
    code: `for x, y in loader:
    optimizer.___1___()
    loss = criterion(model(x), y)
    loss.___2___()
    optimizer.___3___()`,
    answers: [['zero_grad'], ['backward'], ['step']],
    hint: "Les gradients s'accumulent par défaut : il faut les remettre à zéro avant backward.",
  },
  {
    id: 'optimizer',
    level: 3,
    title: 'Loss et optimiseur',
    concept: 'Entraînement',
    statement: 'Pour une classification multi-classes, choisis la loss et un optimiseur Adam (lr = 1e-3).',
    code: `import torch.nn as nn
import torch.optim as optim

criterion = nn.___1___()
optimizer = optim.___2___(model.___3___(), lr=1e-3)`,
    answers: [['CrossEntropyLoss'], ['Adam'], ['parameters']],
    hint: "CrossEntropyLoss attend des logits bruts (pas de softmax avant). L'optimiseur reçoit model.parameters().",
  },
  {
    id: 'dataloader',
    level: 3,
    title: 'Dataset et DataLoader',
    concept: 'Données',
    statement: 'Construis un DataLoader qui mélange les données et sert des batchs de 32.',
    code: `from torch.utils.data import TensorDataset, DataLoader

ds = TensorDataset(X, y)
loader = DataLoader(ds, batch_size=___1___, ___2___=True)`,
    answers: [['32'], ['shuffle']],
    hint: 'Argument booléen pour mélanger à chaque epoch.',
  },
  {
    id: 'device',
    level: 3,
    title: 'Utiliser le GPU',
    concept: 'Devices',
    statement: 'Choisis automatiquement GPU/CPU, puis envoie le modèle et les données dessus.',
    code: `device = "cuda" if torch.cuda.___1___() else "cpu"
model = model.___2___(device)
x = x.to(___3___)`,
    answers: [['is_available'], ['to'], ['device']],
    hint: "Le modèle ET les tenseurs doivent être sur le même device.",
  },
  {
    id: 'cnn-shapes',
    level: 4,
    title: 'Dimensions dans un CNN',
    concept: 'CNN',
    statement:
      'Entrée : 1×28×28. Conv2d(1, 8, kernel_size=3, padding=1) conserve 28×28, puis MaxPool2d(2) donne 14×14. Quelle taille pour le Linear après flatten ?',
    code: `self.conv = nn.Conv2d(1, 8, kernel_size=3, padding=1)
self.pool = nn.MaxPool2d(2)
self.fc = nn.Linear(8 * ___1___ * ___2___, 10)`,
    answers: [['14'], ['14']],
    hint: '28 / 2 = 14 ; il y a 8 canaux de sortie → 8×14×14.',
  },
  {
    id: 'save-load',
    level: 4,
    title: 'Sauvegarder / charger un modèle',
    concept: 'Persistance',
    statement: "Sauvegarde les poids (state_dict) puis recharge-les, et passe en mode évaluation.",
    code: `torch.save(model.___1___(), "model.pt")

model = Net()
model.load_state_dict(torch.___2___("model.pt"))
model.___3___()   # désactive dropout / batchnorm train`,
    answers: [['state_dict'], ['load'], ['eval']],
    hint: 'On sauvegarde le dictionnaire des paramètres, pas l\'objet entier.',
  },
];

export const normalize = (s) => s.replace(/\s+/g, '').toLowerCase();

export function checkAnswers(ex, values) {
  return ex.answers.map((ok, i) => ok.some((a) => normalize(a) === normalize(values[i] || '')));
}

export function fillCode(ex, values) {
  return ex.code.replace(/___(\d)___/g, (_, n) => values[n - 1] || '___');
}
