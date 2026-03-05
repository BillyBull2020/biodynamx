// ═══════════════════════════════════════════════════════════════════
// BIODYNAMX — BACKUP & SNAPSHOT SYSTEM
// ═══════════════════════════════════════════════════════════════════
//
// Creates timestamped snapshots of the entire BioDynamX project.
// Use this before making major changes or when deploying.
//
// Usage (from terminal):
//   npx tsx src/lib/backup.ts
//
// Or call the exported function from any server-side code.
// ═══════════════════════════════════════════════════════════════════

import { execSync } from "child_process";
import * as path from "path";
import * as fs from "fs";

const PROJECT_ROOT = path.resolve(__dirname, "../../..");
const BACKUP_DIR = path.join(PROJECT_ROOT, ".backups");

export interface BackupManifest {
    id: string;
    timestamp: string;
    type: "full" | "incremental" | "config_only";
    description: string;
    files: string[];
    sizeBytes: number;
    gitHash?: string;
    agents: string[];
}

// ── Create Backup ──────────────────────────────────────────────
export function createBackup(
    description: string = "Manual backup",
    type: "full" | "incremental" | "config_only" = "full"
): BackupManifest {
    const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
    const backupId = `backup-${timestamp}`;
    const backupPath = path.join(BACKUP_DIR, backupId);

    // Create backup directory
    fs.mkdirSync(backupPath, { recursive: true });

    // Determine what to include
    const includePaths = type === "config_only"
        ? [
            ".env.local",
            "src/clones/",
            "src/lib/master-orchestrator.ts",
            "src/lib/agent-knowledge.ts",
            "BILLY_CORE.md",
            "package.json",
        ]
        : [
            "src/",
            "public/",
            ".env.local",
            "package.json",
            "tsconfig.json",
            "next.config.ts",
            "BILLY_CORE.md",
        ];

    const backedUpFiles: string[] = [];
    let totalSize = 0;

    includePaths.forEach(relPath => {
        const sourcePath = path.join(PROJECT_ROOT, relPath);
        const destPath = path.join(backupPath, relPath);

        if (!fs.existsSync(sourcePath)) return;

        const stat = fs.statSync(sourcePath);

        if (stat.isDirectory()) {
            // Copy directory recursively, excluding node_modules and .next
            try {
                execSync(
                    `rsync -a --exclude='node_modules' --exclude='.next' --exclude='.backups' "${sourcePath}" "${path.dirname(destPath)}/"`,
                    { cwd: PROJECT_ROOT }
                );
                backedUpFiles.push(relPath + " (directory)");
            } catch {
                // Fallback: manual copy
                fs.cpSync(sourcePath, destPath, {
                    recursive: true,
                    filter: (src) => !src.includes("node_modules") && !src.includes(".next"),
                });
                backedUpFiles.push(relPath + " (directory)");
            }
        } else {
            fs.mkdirSync(path.dirname(destPath), { recursive: true });
            fs.copyFileSync(sourcePath, destPath);
            totalSize += stat.size;
            backedUpFiles.push(relPath);
        }
    });

    // Calculate total size
    try {
        const sizeOutput = execSync(`du -sb "${backupPath}" 2>/dev/null || du -sk "${backupPath}"`, { encoding: "utf-8" });
        totalSize = parseInt(sizeOutput.split("\t")[0]) || totalSize;
    } catch {
        // Ignore size calculation errors
    }

    // Get git hash if available
    let gitHash: string | undefined;
    try {
        gitHash = execSync("git rev-parse HEAD", { cwd: PROJECT_ROOT, encoding: "utf-8" }).trim();
    } catch {
        // Not a git repo, skip
    }

    // Build manifest
    const manifest: BackupManifest = {
        id: backupId,
        timestamp: new Date().toISOString(),
        type,
        description,
        files: backedUpFiles,
        sizeBytes: totalSize,
        gitHash,
        agents: [
            "Aria (Receptionist)",
            "Jenny (Diagnostician)",
            "Mark (Closer)",
            "Journey (Hunter)",
            "Sarah (Support)",
            "Billy (Architect)",
            "Scout (Lead Hunter)",
            "Atlas (HR Manager)",
            "Rex (Reputation Guard)",
        ],
    };

    // Save manifest
    fs.writeFileSync(
        path.join(backupPath, "manifest.json"),
        JSON.stringify(manifest, null, 2)
    );

    console.log(`\n✅ Backup created: ${backupId}`);
    console.log(`   Type: ${type}`);
    console.log(`   Files: ${backedUpFiles.length}`);
    console.log(`   Size: ${(totalSize / 1024 / 1024).toFixed(2)} MB`);
    console.log(`   Location: ${backupPath}\n`);

    return manifest;
}

// ── List Backups ───────────────────────────────────────────────
export function listBackups(): BackupManifest[] {
    if (!fs.existsSync(BACKUP_DIR)) return [];

    const dirs = fs.readdirSync(BACKUP_DIR)
        .filter(d => d.startsWith("backup-"))
        .sort()
        .reverse(); // Most recent first

    return dirs.map(dir => {
        const manifestPath = path.join(BACKUP_DIR, dir, "manifest.json");
        if (fs.existsSync(manifestPath)) {
            return JSON.parse(fs.readFileSync(manifestPath, "utf-8")) as BackupManifest;
        }
        return {
            id: dir,
            timestamp: dir.replace("backup-", ""),
            type: "full" as const,
            description: "Legacy backup (no manifest)",
            files: [],
            sizeBytes: 0,
            agents: [],
        };
    });
}

// ── Restore Backup ─────────────────────────────────────────────
export function restoreBackup(backupId: string): boolean {
    const backupPath = path.join(BACKUP_DIR, backupId);

    if (!fs.existsSync(backupPath)) {
        console.error(`❌ Backup not found: ${backupId}`);
        return false;
    }

    // Safety: Create a pre-restore backup first
    console.log("📦 Creating pre-restore safety backup...");
    createBackup(`Pre-restore safety backup (before restoring ${backupId})`, "config_only");

    // Restore files
    const manifestPath = path.join(backupPath, "manifest.json");
    if (fs.existsSync(manifestPath)) {
        const manifest = JSON.parse(fs.readFileSync(manifestPath, "utf-8")) as BackupManifest;
        console.log(`\n🔄 Restoring backup: ${manifest.description}`);
        console.log(`   Created: ${manifest.timestamp}`);
        console.log(`   Files: ${manifest.files.length}`);
    }

    // Copy files back (exclude manifest and .backups)
    try {
        execSync(
            `rsync -a --exclude='manifest.json' --exclude='.backups' "${backupPath}/" "${PROJECT_ROOT}/"`,
            { cwd: PROJECT_ROOT }
        );
        console.log("✅ Backup restored successfully");
        return true;
    } catch (error) {
        console.error("❌ Restore failed:", error);
        return false;
    }
}

// ── CLI Entry Point ────────────────────────────────────────────
if (require.main === module) {
    const action = process.argv[2] || "create";
    const arg = process.argv[3];

    switch (action) {
        case "create":
            createBackup(arg || "CLI backup");
            break;
        case "list":
            const backups = listBackups();
            console.log(`\n📦 ${backups.length} backups found:\n`);
            backups.forEach(b => {
                console.log(`  ${b.id}`);
                console.log(`    ${b.description} (${b.type})`);
                console.log(`    ${new Date(b.timestamp).toLocaleString()}`);
                console.log(`    ${(b.sizeBytes / 1024 / 1024).toFixed(2)} MB\n`);
            });
            break;
        case "restore":
            if (!arg) {
                console.error("Usage: npx tsx src/lib/backup.ts restore <backup-id>");
                process.exit(1);
            }
            restoreBackup(arg);
            break;
        default:
            console.log("Usage: npx tsx src/lib/backup.ts [create|list|restore] [args]");
    }
}
