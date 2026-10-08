export default {
  id: "cnn",
  name: "Convolutional Neural Network (CNN)",
  track: "deep-learning",
  category: "Neural Architectures",
  task: ["Computer Vision", "Image Classification", "Object Detection"],
  difficulty: "Advanced",
  summary: "A specialized neural network architecture that uses learnable convolutional filters to automatically detect spatial patterns (edges, textures, shapes, objects) in grid-structured data like images.",
  intuition: "The Magnifying Glass Scanner: A small sliding window (filter/kernel) scans across the image systematically. Early layers detect simple edges and corners. Middle layers combine edges into eyes, noses, and wheels. Deep layers recognize full faces, cars, and dogs.",
  whenToUse: "Any task involving images, video frames, spectrograms, or 2D spatial data. Image classification, object detection, medical imaging, satellite imagery analysis.",
  whenToAvoid: "Tabular data (tree ensembles are superior), or 1D sequential data without spatial locality (use Transformers or RNNs).",
  requirements: {
    scalingRequired: true,
    handlesMissing: false,
    outlierSensitive: false,
    linearRelationship: false
  },
  parameters: [
    {
      name: "Convolutional Filters (Kernels)",
      type: "tensor",
      default: "3×3 or 5×5",
      impact: "Small weight matrices that slide across the input to detect local patterns.",
      tuningTip: "3×3 kernels stacked deeply (VGG-style) are more efficient than single large kernels."
    },
    {
      name: "Pooling Layers (MaxPool)",
      type: "operation",
      default: "2×2 stride 2",
      impact: "Downsamples feature maps by taking the maximum value in each 2×2 region.",
      tuningTip: "Reduces spatial dimensions by 50% while retaining the strongest activations."
    },
    {
      name: "Number of Filters per Layer",
      type: "int",
      default: "32, 64, 128, 256...",
      impact: "Number of unique patterns each layer can detect.",
      tuningTip: "Double filters when halving spatial dimensions (common architecture pattern)."
    }
  ],
  math: {
    formula: "Feature Map = ReLU( Input ⊛ Kernel + Bias )  where ⊛ = 2D convolution",
    loss: "Cross-Entropy + Backpropagation through Convolutional Layers",
    explanation: "Convolution operation slides learnable kernels across the input, computing element-wise products and summing. This achieves parameter sharing (same kernel detects the same pattern anywhere in the image) and translation equivariance."
  },
  pros: [
    "Automatic hierarchical feature extraction from raw pixels (no manual feature engineering)",
    "Parameter sharing via convolutional kernels makes CNNs extremely parameter-efficient",
    "Translation-invariant: detects a cat whether it's in the top-left or bottom-right of the image",
    "Backbone of modern computer vision (ResNet, EfficientNet, YOLO)"
  ],
  cons: [
    "Requires large labeled image datasets (or transfer learning from pretrained models)",
    "Computationally expensive: needs GPU acceleration for practical training times",
    "Not suitable for non-spatial data (tabular, text without spatial structure)"
  ],
  prerequisites: ["mlp-neural-network", "activation-functions"],
  related: ["transfer-learning", "dl-regularization", "transformer-architecture", "autoencoders"],
  diagram: `flowchart LR
  I["Image 32×32×3"] --> C1["Conv 3×3, 32 filters"]
  C1 --> R1["ReLU → edge maps"]
  R1 --> P1["MaxPool 2×2 → 16×16"]
  P1 --> C2["Conv 3×3, 64 filters"]
  C2 --> R2["ReLU → textures and parts"]
  R2 --> P2["MaxPool 2×2 → 8×8"]
  P2 --> F["Flatten feature maps"]
  F --> D["Dense layer + Dropout"]
  D --> S["Softmax over classes"]
  S --> Y(["Prediction: cat 0.92"])`,
  codeSnippet: `import torch
import torch.nn as nn

class SimpleCNN(nn.Module):
    def __init__(self, num_classes=10):
        super().__init__()
        self.features = nn.Sequential(
            nn.Conv2d(3, 32, kernel_size=3, padding=1),  # 3 RGB channels → 32 filters
            nn.ReLU(),
            nn.MaxPool2d(2, 2),                           # 32×32 → 16×16
            nn.Conv2d(32, 64, kernel_size=3, padding=1),
            nn.ReLU(),
            nn.MaxPool2d(2, 2),                           # 16×16 → 8×8
        )
        self.classifier = nn.Sequential(
            nn.Flatten(),
            nn.Linear(64 * 8 * 8, 128),
            nn.ReLU(),
            nn.Dropout(0.3),
            nn.Linear(128, num_classes)
        )
    
    def forward(self, x):
        x = self.features(x)
        return self.classifier(x)`
};
