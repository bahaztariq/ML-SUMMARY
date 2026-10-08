export default {
  id: "generative-models",
  name: "Generative Models (GANs & Diffusion)",
  track: "deep-learning",
  category: "Generative AI",
  task: ["Computer Vision", "Architecture"],
  difficulty: "Advanced",
  summary: "Models that learn the probability distribution of the training data so they can create brand-new realistic samples, such as images, audio or synthetic tabular records.",
  intuition: "The Forger and the Restorer: A GAN is a forger (generator) and an art detective (discriminator) locked in a contest until the fakes are indistinguishable from real paintings. A diffusion model is a restorer who learned to remove a tiny bit of dust from a painting; starting from pure static and cleaning step by step, it reveals a brand-new picture.",
  whenToUse: "Image, video and audio generation (text-to-image), super-resolution and inpainting, data augmentation for rare classes, synthetic data for privacy, and style transfer.",
  whenToAvoid: "Ordinary prediction tasks (classification / regression), when you lack large GPU budgets and big datasets, or when generated content could create legal, consent or misinformation problems you cannot manage.",
  requirements: {
    scalingRequired: true,
    handlesMissing: false,
    outlierSensitive: false,
    gpuAcceleration: true
  },
  parameters: [
    {
      name: "Diffusion timesteps T",
      type: "int",
      default: "1000 (training), 20–50 (sampling)",
      impact: "Number of noise levels; more sampling steps give higher quality but slower generation.",
      tuningTip: "Use fast samplers (DDIM, DPM-Solver) to cut inference to 20–30 steps."
    },
    {
      name: "Guidance scale",
      type: "float",
      default: "7.5",
      impact: "Classifier-free guidance: how strongly the output follows the text prompt.",
      tuningTip: "5–9 is typical; very high values oversaturate images and reduce diversity."
    },
    {
      name: "GAN learning rates (G vs D)",
      type: "float",
      default: "2e-4, Adam β₁ = 0.5",
      impact: "Balance between generator and discriminator training speed.",
      tuningTip: "If D wins too easily, G gets no useful gradient: lower D's LR or add label smoothing / spectral norm."
    },
    {
      name: "Latent / noise dimension",
      type: "int",
      default: "100 (GAN z)",
      impact: "Size of the random input that seeds each new sample.",
      tuningTip: "Latent diffusion (Stable Diffusion) runs in a compressed autoencoder latent space for speed."
    }
  ],
  math: {
    formula: "GAN: min_G max_D E[log D(x)] + E[log(1 − D(G(z)))]  |  Diffusion: L = E‖ε − ε_θ(x_t, t)‖²",
    loss: "Adversarial minimax loss (GAN) / noise-prediction MSE (Diffusion)",
    explanation: "In a GAN, D maximizes its ability to tell real from fake while G minimizes it, pushing G's output distribution toward the real one. In diffusion, Gaussian noise ε is added to a real image x to produce x_t; the network ε_θ learns to predict that noise, so at generation time it can denoise pure random noise step by step into a new sample."
  },
  pros: [
    "Produces strikingly realistic images, audio and video",
    "Diffusion models train stably and cover diverse modes of the data",
    "GANs generate in a single fast forward pass",
    "Useful for data augmentation and privacy-preserving synthetic data"
  ],
  cons: [
    "GANs suffer from unstable training and mode collapse",
    "Diffusion sampling is slow (many denoising steps)",
    "Huge data and compute requirements; hard to evaluate (FID, human judgment)",
    "Serious risks: deepfakes, copyright and bias concerns"
  ],
  prerequisites: ["autoencoders", "cnn"],
  related: ["llms", "transformer-architecture", "class-imbalance"],
  diagram: `flowchart TD
  subgraph gan["GAN"]
    Z["Random noise z"] --> G["Generator"]
    G --> FK["Fake sample"]
    RL[("Real samples")] --> D{"Discriminator: real or fake?"}
    FK --> D
    D -.->|"feedback: improve fakes"| G
  end
  subgraph diff["Diffusion"]
    X0["Real image x₀"] -->|"add noise over T steps"| XT["Pure noise x_T"]
    XT --> NN["Network predicts noise ε at step t"]
    NN -->|"subtract noise, repeat T → 0"| OUT["New generated image"]
    P["Text prompt embedding"] -.->|"guidance"| NN
  end`,
  codeSnippet: `import torch
from diffusers import StableDiffusionPipeline

# Text-to-image with a pretrained latent diffusion model
pipe = StableDiffusionPipeline.from_pretrained(
    "stabilityai/stable-diffusion-2-1-base",
    torch_dtype=torch.float16,
).to("cuda")

image = pipe(
    prompt="watercolor illustration of a lighthouse at sunset",
    num_inference_steps=30,     # denoising steps
    guidance_scale=7.5,         # how strongly to follow the prompt
    generator=torch.Generator("cuda").manual_seed(42),
).images[0]
image.save("lighthouse.png")

# --- Core of one GAN training step (simplified) ---
# real: batch of real images, z: random noise
def gan_step(G, D, real, opt_G, opt_D, bce=torch.nn.BCEWithLogitsLoss()):
    z = torch.randn(real.size(0), 100, device=real.device)
    fake = G(z)
    ones, zeros = torch.ones(real.size(0), 1), torch.zeros(real.size(0), 1)
    # 1) Discriminator: real -> 1, fake -> 0
    opt_D.zero_grad()
    d_loss = bce(D(real), ones) + bce(D(fake.detach()), zeros)
    d_loss.backward(); opt_D.step()
    # 2) Generator: fool D into predicting 1 for fakes
    opt_G.zero_grad()
    g_loss = bce(D(fake), ones)
    g_loss.backward(); opt_G.step()
    return d_loss.item(), g_loss.item()`
};
