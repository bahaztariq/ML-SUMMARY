export default {
  id: "q-learning",
  name: "Q-Learning & Deep Q-Networks (DQN)",
  track: "ml-models",
  category: "Reinforcement Learning",
  task: ["Reinforcement Learning", "Optimization"],
  difficulty: "Advanced",
  summary: "A model-free reinforcement learning algorithm that learns the expected long-term reward Q(s, a) of each action in each state, so an agent can act optimally by picking the highest-valued action.",
  intuition: "The Maze Mouse: A mouse wanders a maze and slowly writes on a mental scoreboard how good each turn at each junction is, based on the cheese it eventually finds. Each time it moves, it nudges the score toward 'the reward I just got + the best score I see from where I landed'. DQN replaces the scoreboard with a neural network so it can handle mazes too big to tabulate, like raw video game pixels.",
  whenToUse: "Sequential decision problems with discrete actions and a clear reward signal: games, robotics in simulation, inventory control, ad bidding policies, or resource scheduling — ideally where a simulator lets the agent fail cheaply millions of times.",
  whenToAvoid: "Continuous action spaces (use policy-gradient / actor-critic methods like PPO or SAC), problems with no simulator where exploration is costly or dangerous, or when a supervised dataset of correct decisions already exists.",
  requirements: {
    scalingRequired: true,
    handlesMissing: false,
    outlierSensitive: true,
    needsEnvironment: true
  },
  parameters: [
    {
      name: "learning_rate (α)",
      type: "float",
      default: "0.1 (tabular) / 1e-4 (DQN)",
      impact: "How strongly each new experience overwrites the old Q estimate.",
      tuningTip: "Too high causes oscillation; decay it over time for tabular convergence."
    },
    {
      name: "discount factor (γ)",
      type: "float",
      default: "0.99",
      impact: "How much future rewards count compared to immediate ones.",
      tuningTip: "0.9–0.99. Lower values make the agent short-sighted but training more stable."
    },
    {
      name: "epsilon (ε) schedule",
      type: "float",
      default: "1.0 → 0.05",
      impact: "Probability of taking a random exploratory action.",
      tuningTip: "Start fully random and decay linearly or exponentially over the first 10–20% of training."
    },
    {
      name: "replay buffer & target update (DQN)",
      type: "architecture",
      default: "100k transitions / every 1k steps",
      impact: "Experience replay breaks sample correlation; a frozen target network stabilizes the bootstrap target.",
      tuningTip: "Use a soft update (τ ≈ 0.005) or hard copy every 1k–10k steps; larger buffers improve stability."
    }
  ],
  math: {
    formula: "Q(s, a) ← Q(s, a) + α · [ r + γ · max_a′ Q(s′, a′) − Q(s, a) ]",
    loss: "TD error / Huber loss: L(θ) = ( r + γ·max_a′ Q_θ⁻(s′, a′) − Q_θ(s, a) )²",
    explanation: "The update moves Q(s, a) toward the Bellman target: the immediate reward plus the discounted value of the best next action. The bracketed term is the temporal-difference (TD) error. DQN approximates Q with a neural network θ and computes the target with a slowly updated copy θ⁻ to avoid chasing a moving target."
  },
  pros: [
    "Model-free: learns directly from experience without knowing environment dynamics",
    "Off-policy: can learn from replayed or logged experience",
    "Tabular Q-learning provably converges to the optimal policy under mild conditions",
    "DQN scales to high-dimensional inputs like images"
  ],
  cons: [
    "Very sample-inefficient — often needs millions of interactions",
    "Only handles discrete actions directly",
    "Max operator overestimates Q-values (mitigated by Double DQN)",
    "Training is unstable and highly sensitive to hyperparameters and reward design"
  ],
  prerequisites: ["supervised-vs-unsupervised", "mlp-neural-network"],
  related: ["dl-optimizers", "what-is-gradient-descent", "llms"],
  diagram: `flowchart TD
    A(["Agent observes state s"]) --> B{"Random number less than ε?"}
    B -->|"yes: explore"| C["Random action a"]
    B -->|"no: exploit"| D["a = argmax Q(s, ·)"]
    C --> E["Environment returns reward r and next state s′"]
    D --> E
    E --> F[("Store (s, a, r, s′) in replay buffer")]
    F --> G["TD target = r + γ · max Q_target(s′, a′)"]
    G --> H["Update Q(s, a) toward target (gradient step for DQN)"]
    H --> I["Decay ε, periodically sync target network"]
    I --> A`,
  codeSnippet: `import numpy as np
import gymnasium as gym

# Tabular Q-learning on a small discrete environment
env = gym.make('FrozenLake-v1', is_slippery=True)
n_states, n_actions = env.observation_space.n, env.action_space.n
Q = np.zeros((n_states, n_actions))

alpha, gamma = 0.1, 0.99
epsilon, eps_min, eps_decay = 1.0, 0.05, 0.9995

for episode in range(20000):
    state, _ = env.reset()
    done = False
    while not done:
        # epsilon-greedy exploration
        if np.random.rand() < epsilon:
            action = env.action_space.sample()
        else:
            action = int(np.argmax(Q[state]))

        next_state, reward, terminated, truncated, _ = env.step(action)
        done = terminated or truncated

        # Bellman / TD update (no bootstrap from terminal states)
        target = reward + gamma * np.max(Q[next_state]) * (not terminated)
        Q[state, action] += alpha * (target - Q[state, action])
        state = next_state

    epsilon = max(eps_min, epsilon * eps_decay)

policy = np.argmax(Q, axis=1)
print("Learned policy:", policy.reshape(4, 4))
# For large/continuous state spaces: stable_baselines3.DQN('MlpPolicy', env)`
};
