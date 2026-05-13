import kagglehub

# Sesuaikan username Kaggle Anda
handle = 'wisnualfiannurashar/colonyai-checkpoint-v8'

# Path folder yang berisi last.pt (harus folder, bukan file langsung)
local_dataset_dir = r'D:\lombapuai\hasil_training_colony\runs\colony_v8\weights'

# Upload sebagai dataset baru
kagglehub.dataset_upload(handle, local_dataset_dir, version_notes='Checkpoint epoch 6 dari training v8')
